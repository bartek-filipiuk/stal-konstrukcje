import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import type { Payload, PayloadRequest, Plugin } from 'payload'
import { z } from 'zod'
import { isAdmin } from '@/access/isAdmin'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/

const PRIVATE_PATTERNS = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^::1$/,
  /^::$/,
  /^f[cd][0-9a-f]{2}:/i,
  /^fe80:/i,
  /^::ffff:/i,
]

function isPrivateAddress(address: string): boolean {
  return PRIVATE_PATTERNS.some((re) => re.test(address))
}

// ponytail: lookup-then-fetch ma teoretyczne okno TOCTOU (DNS rebinding);
// wystarczające dla zaufanych klientów MCP z kluczem — pełny fix to custom
// Agent pinujący rozwiązany IP, dodać gdyby klucze trafiały do stron trzecich.
export async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Only http(s) URLs are allowed, got: ${url.protocol}`)
  }
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new Error(`Blocked host: ${host}`)
  }
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true })
  for (const { address } of addresses) {
    if (isPrivateAddress(address)) {
      throw new Error(`Blocked private address for host ${host}: ${address}`)
    }
  }
}

export async function markdownToLexical(payload: Payload, markdown: string): Promise<object> {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  return convertMarkdownToLexical({ editorConfig, markdown })
}

const CONTENT_GUIDE = `# Content authoring guide

## Workflow for creating a page
1. Read the inputSchema of createPages from tools/list — the block list there is
   the source of truth. There is NO getCollectionSchema tool on this server.
2. Upload images first (uploadMediaFromUrl) and note their IDs.
3. Build rich text via markdownToRichText — NEVER hand-craft Lexical JSON.
4. Create the page as draft, verify, then update with _status: "published".

## Required fields (schema-level, the API will reject without them)
- pages: title, layout (min 1 block), hero.type ("none"|"highImpact"|"mediumImpact"|"lowImpact").
- hero.media is required by schema when hero.type is highImpact/mediumImpact.
- posts: title, content (Lexical).

## Drafts & publishing
Pages/posts are draft-enabled (autosave). Always pass _status explicitly:
"draft" while iterating, "published" to go live. Publishing triggers
frontend revalidation automatically.

## Locale gotcha
Only \`title\` is localized (pl default, en). ALL other fields (layout,
hero, meta, globals) are SHARED between locales — writing them with
?locale=en overwrites the Polish site too.

## IDs & relationships
IDs are numeric. Upload fields (hero.media, backgroundMedia, avatar,
meta.image) take a media ID. Link fields: { type: "reference"|"custom",
reference: { relationTo: "pages"|"posts", value: <id> }, url, label }.

## Do not touch
users, search (auto-derived), payload-* internals. form-submissions is
read-only. Never call any seed endpoint.
`

const uploadMediaFromUrlSchema = z.object({
  url: z.string().describe('Public http(s) URL of the image'),
  alt: z.string().describe('Alt text for accessibility and SEO'),
  filename: z.string().optional().describe('Optional filename override, e.g. "hero.jpg"'),
})

const markdownToRichTextSchema = z.object({
  markdown: z.string().describe('Markdown source text'),
})

type ToolResult = { content: { text: string; type: 'text' }[] }

// Wyciągnięte z configu toola, żeby granica zaufania (SSRF + whitelist MIME + capy
// rozmiaru) dała się testować bez stawiania całego transportu MCP.
export async function uploadMediaFromUrlHandler(
  payload: Payload,
  rawArgs: unknown,
  user: PayloadRequest['user'],
): Promise<ToolResult> {
  const args = uploadMediaFromUrlSchema.parse(rawArgs)
  await assertPublicHttpUrl(args.url)
  const res = await fetch(args.url, {
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`)
  const mime = (res.headers.get('content-type') || '').split(';')[0].trim()
  if (!ALLOWED_MIME.test(mime)) throw new Error(`Not an allowed image type: ${mime}`)
  const declared = Number(res.headers.get('content-length') || 0)
  if (declared > MAX_UPLOAD_BYTES)
    throw new Error(`File too large: ${declared} bytes (max ${MAX_UPLOAD_BYTES})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length > MAX_UPLOAD_BYTES)
    throw new Error(`File too large: ${buffer.length} bytes (max ${MAX_UPLOAD_BYTES})`)
  const name = args.filename || new URL(args.url).pathname.split('/').pop() || 'upload'
  // Bez user + overrideAccess:false tool pisałby do media z prawami roota, omijając
  // access control kolekcji (klucz podpięty do kogokolwiek tworzyłby media).
  const doc = await payload.create({
    collection: 'media',
    data: { alt: args.alt },
    file: { data: buffer, mimetype: mime, name, size: buffer.length },
    overrideAccess: false,
    user: user ?? undefined,
  })
  return {
    content: [
      { type: 'text', text: JSON.stringify({ id: doc.id, url: doc.url, alt: doc.alt }) },
    ],
  }
}

export const mcpServerPlugin: Plugin = mcpPlugin({
  // Klucz MCP leci nagłówkiem `Bearer`, którego żadna strategia auth Payloada nie
  // rozpoznaje (JWT go nie zwaliduje, API-Key chce prefiksu `<slug> API-Key`), więc
  // w custom toolach `req.user` byłoby NULL-em. Plugin rozwiązuje usera z klucza tylko
  // na własny użytek — tu przepisujemy go do req, żeby toole pisały JAKO ten user,
  // pod normalną kontrolą dostępu (patrz uploadMediaFromUrlHandler).
  overrideAuth: async (req, getDefaultMcpAccessSettings) => {
    const settings = await getDefaultMcpAccessSettings()
    req.user = settings.user
    return settings
  },
  // Plugin oddaje kolekcję kluczy BEZ bloku access, więc Payload nakłada
  // defaultAccess (`Boolean(user)`): każdy zalogowany editor mógłby wylistować
  // klucze plaintextem (`apiKey` ma afterRead decryptKey), przepiąć `user` na
  // admina albo odhaczyć sobie uprawnienia. Klucze to sekrety — wyłącznie admin.
  overrideApiKeyCollection: (collection) => ({
    ...collection,
    access: { create: isAdmin, delete: isAdmin, read: isAdmin, update: isAdmin },
  }),
  collections: {
    pages: {
      enabled: true,
      description:
        'Website pages built from blocks. `layout` (array of blocks) is REQUIRED, as are `title`, `hero.type` and — for high/medium impact heroes — `hero.media`. The block list lives in this tool\'s own inputSchema. Pages use drafts: pass `_status: "published"` to publish. Read the payload://content-guide resource before creating pages.',
    },
    posts: {
      enabled: true,
      description:
        'Blog posts. `content` is Lexical rich text — build it with the markdownToRichText tool, never hand-craft Lexical JSON. Posts use drafts: pass `_status: "published"` to publish.',
    },
    categories: {
      enabled: true,
      description: 'Post categories (nested taxonomy via `parent`).',
    },
    media: {
      enabled: true,
      description:
        'Uploaded images. To add a new image from a URL use the uploadMediaFromUrl tool; direct create requires multipart upload which MCP cannot do.',
    },
    redirects: {
      enabled: true,
      description:
        'URL redirects (from -> to). The site must be rebuilt for changes to take effect.',
    },
    forms: {
      enabled: true,
      description: 'Form definitions (form-builder plugin): fields, confirmation message, emails.',
    },
    'form-submissions': {
      enabled: { find: true },
      description: 'Read-only: submissions from site visitors (leads).',
    },
  },
  globals: {
    header: {
      enabled: { find: true, update: true },
      description: 'Site header navigation (navItems, max 6).',
    },
    footer: {
      enabled: { find: true, update: true },
      description: 'Footer: navigation, social/contact/newsletter display toggles.',
    },
    'site-settings': {
      enabled: { find: true, update: true },
      description: 'Site-wide settings: name, logo, contact data, social links.',
    },
  },
  mcp: {
    resources: [
      {
        name: 'content-guide',
        title: 'Content authoring guide',
        description: 'READ FIRST: how to build pages/posts on this site without errors.',
        uri: 'payload://content-guide',
        mimeType: 'text/markdown',
        handler: async (uri: { href: string }) => ({
          contents: [
            {
              uri: uri.href,
              text: CONTENT_GUIDE,
            },
          ],
        }),
      },
    ],
    tools: [
      {
        name: 'uploadMediaFromUrl',
        description:
          'Download an image from a public http(s) URL server-side and create a media document. Max 10 MB, images only. Returns the created media document ID for use in upload/relationship fields.',
        parameters: uploadMediaFromUrlSchema.shape,
        handler: async (rawArgs, req) => uploadMediaFromUrlHandler(req.payload, rawArgs, req.user),
      },
      {
        name: 'markdownToRichText',
        description:
          'Convert markdown to Payload Lexical rich text JSON. ALWAYS use this for richText fields (posts content, hero richText, content blocks) instead of hand-crafting Lexical JSON.',
        parameters: markdownToRichTextSchema.shape,
        handler: async (rawArgs, req) => {
          const args = markdownToRichTextSchema.parse(rawArgs)
          const state = await markdownToLexical(req.payload, args.markdown)
          return { content: [{ type: 'text' as const, text: JSON.stringify(state) }] }
        },
      },
    ],
  },
})
