import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { assertPublicHttpUrl, markdownToLexical, uploadMediaFromUrlHandler } from '@/plugins/mcp'
import { getTestPayload, uniqueEmail } from './helpers'

describe('assertPublicHttpUrl (anti-SSRF)', () => {
  it('rejects non-http schemes', async () => {
    await expect(assertPublicHttpUrl('file:///etc/passwd')).rejects.toThrow()
    await expect(assertPublicHttpUrl('ftp://example.com/x')).rejects.toThrow()
  })
  it('rejects private and loopback addresses', async () => {
    await expect(assertPublicHttpUrl('http://127.0.0.1/x')).rejects.toThrow()
    await expect(assertPublicHttpUrl('http://10.0.0.5/x')).rejects.toThrow()
    await expect(assertPublicHttpUrl('http://192.168.1.1/x')).rejects.toThrow()
    await expect(assertPublicHttpUrl('http://169.254.169.254/latest')).rejects.toThrow()
    await expect(assertPublicHttpUrl('http://[::1]/x')).rejects.toThrow()
    await expect(assertPublicHttpUrl('http://localhost:3000/x')).rejects.toThrow()
  })
  it('accepts a public https url', async () => {
    await expect(
      assertPublicHttpUrl('https://images.example-cdn.com/a.jpg'),
    ).resolves.toBeUndefined()
  })
})

describe('uploadMediaFromUrlHandler (limity uploadu)', () => {
  // Podstawiamy minimalny obiekt zamiast prawdziwego Response — tylko tak da się
  // wymusić BRAK nagłówka content-length (Response sam by go dorobił).
  const stubFetch = (headers: Record<string, string>, body: Buffer) =>
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      status: 200,
      headers: new Headers(headers),
      arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.length),
    }))

  // Host publiczny, żeby przejść assertPublicHttpUrl i dotrzeć do testowanych gałęzi.
  const URL_OK = 'https://images.example-cdn.com/a.png'
  const OVER_CAP = 11 * 1024 * 1024

  afterEach(() => vi.unstubAllGlobals())

  // Bot MCP: klucz działa JAKO powiązany user, więc handler dostaje principala z `users`.
  const makeBot = (payload: Payload) =>
    payload.create({
      collection: 'users',
      data: {
        name: 'Upload Bot',
        email: uniqueEmail('uploadbot'),
        password: 'test1234',
        role: 'editor',
      },
    })

  const png = Buffer.from(
    // 1x1 PNG — realny plik, więc przechodzi też sniffing magic bytes w Payloadzie.
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAA' +
      'AABJRU5ErkJggg==',
    'base64',
  )

  it('rejects a non-image content-type', async () => {
    const payload = await getTestPayload()
    stubFetch({ 'content-type': 'text/html; charset=utf-8' }, Buffer.from('<h1>nope</h1>'))
    await expect(
      uploadMediaFromUrlHandler(payload, { url: URL_OK, alt: 'x' }, null),
    ).rejects.toThrow(/Not an allowed image type/)
  })

  it('rejects a declared content-length over the cap', async () => {
    const payload = await getTestPayload()
    // Ciało małe — odrzucenie musi paść na zadeklarowanym rozmiarze, przed pobraniem.
    stubFetch(
      { 'content-type': 'image/png', 'content-length': String(OVER_CAP) },
      Buffer.alloc(16),
    )
    await expect(
      uploadMediaFromUrlHandler(payload, { url: URL_OK, alt: 'x' }, null),
    ).rejects.toThrow(/File too large/)
  })

  it('rejects an actual body over the cap when content-length is absent (lying server)', async () => {
    const payload = await getTestPayload()
    stubFetch({ 'content-type': 'image/png' }, Buffer.alloc(OVER_CAP))
    await expect(
      uploadMediaFromUrlHandler(payload, { url: URL_OK, alt: 'x' }, null),
    ).rejects.toThrow(/File too large/)
  })

  it('accepts a real png under the cap dla powiązanego usera (guard nie blokuje wszystkiego)', async () => {
    const payload = await getTestPayload()
    const bot = await makeBot(payload)
    stubFetch({ 'content-type': 'image/png', 'content-length': String(png.length) }, png)
    const result = await uploadMediaFromUrlHandler(
      payload,
      { url: URL_OK, alt: 'pixel', filename: `mcp-test-${Date.now()}.png` },
      { ...bot, collection: 'users' as const },
    )
    const created = JSON.parse(result.content[0].text)
    expect(created.id).toBeTruthy()
    expect(created.alt).toBe('pixel')
    await payload.delete({ collection: 'media', id: created.id })
    await payload.delete({ collection: 'users', id: bot.id })
  })

  it('tworzy media POD kontrolą dostępu — bez principala i surowym kluczem odmawia', async () => {
    const payload = await getTestPayload()
    const bot = await makeBot(payload)
    const keyDoc = await payload.create({
      collection: 'payload-mcp-api-keys',
      data: { user: bot.id, label: 'upload key' },
    })
    const args = { url: URL_OK, alt: 'pixel', filename: `mcp-denied-${Date.now()}.png` }
    stubFetch({ 'content-type': 'image/png', 'content-length': String(png.length) }, png)
    // Brak usera (tak wyglądał req.user w toolach przed podpięciem overrideAuth).
    await expect(uploadMediaFromUrlHandler(payload, args, null)).rejects.toThrow()
    stubFetch({ 'content-type': 'image/png', 'content-length': String(png.length) }, png)
    // Surowy klucz jako principal też nie przechodzi (media.create = authenticated).
    await expect(
      uploadMediaFromUrlHandler(payload, args, {
        ...keyDoc,
        collection: 'payload-mcp-api-keys' as const,
      }),
    ).rejects.toThrow()
    await payload.delete({ collection: 'payload-mcp-api-keys', id: keyDoc.id })
    await payload.delete({ collection: 'users', id: bot.id })
  })
})

describe('dostęp do kolekcji kluczy MCP', () => {
  it('editor nie czyta ani nie tworzy kluczy API (to sekrety, tylko admin)', async () => {
    const payload = await getTestPayload()
    const editor = await payload.create({
      collection: 'users',
      data: {
        name: 'Key Peeker',
        email: uniqueEmail('peeker'),
        password: 'test1234',
        role: 'editor',
      },
    })
    await expect(
      payload.find({ collection: 'payload-mcp-api-keys', overrideAccess: false, user: editor }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'payload-mcp-api-keys',
        data: { user: editor.id, label: 'escalation' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
    await payload.delete({ collection: 'users', id: editor.id })
  })

  it('surowy klucz MCP nie przechodzi jako principal na zwykłym REST', async () => {
    const payload = await getTestPayload()
    const owner = await payload.create({
      collection: 'users',
      data: {
        name: 'Bot Owner',
        email: uniqueEmail('bot'),
        password: 'test1234',
        role: 'editor',
      },
    })
    const keyDoc = await payload.create({
      collection: 'payload-mcp-api-keys',
      data: { user: owner.id, label: 'test key' },
    })
    // Dokładnie taki principal ląduje w req.user, gdy ktoś strzeli surowym kluczem
    // w /api/categories zamiast w /api/mcp (globalna strategia API-Key Payloada).
    // Celowo NIE kolekcja upload (media): tam create i tak by rzucił na braku pliku,
    // więc test przechodziłby niezależnie od reguły access (sprawdzone mutacją).
    const rawKeyPrincipal = { ...keyDoc, collection: 'payload-mcp-api-keys' as const }
    await expect(
      payload.create({
        collection: 'categories',
        data: { title: 'via raw key', slug: 'via-raw-key' },
        overrideAccess: false,
        user: rawKeyPrincipal,
      }),
    ).rejects.toThrow()
    await payload.delete({ collection: 'payload-mcp-api-keys', id: keyDoc.id })
    await payload.delete({ collection: 'users', id: owner.id })
  })
})

describe('zapisy poza kolekcjami z jawnym access', () => {
  // Globale i kolekcje z pluginów definiują zwykle tylko `read`; resztę Payload
  // dociąga jako defaultAccess (`Boolean(user)`), co przepuszczało surowy klucz MCP.
  const makeKeyPrincipal = async (payload: Payload) => {
    const owner = await payload.create({
      collection: 'users',
      data: {
        name: 'Glob Bot',
        email: uniqueEmail('globbot'),
        password: 'test1234',
        role: 'editor',
      },
    })
    const keyDoc = await payload.create({
      collection: 'payload-mcp-api-keys',
      data: { user: owner.id, label: 'globals key' },
    })
    return { owner, keyDoc, principal: { ...keyDoc, collection: 'payload-mcp-api-keys' as const } }
  }

  it('surowy klucz MCP nie zapisze globala', async () => {
    const payload = await getTestPayload()
    const { owner, keyDoc, principal } = await makeKeyPrincipal(payload)
    for (const slug of ['header', 'footer', 'site-settings'] as const) {
      await expect(
        payload.updateGlobal({
          slug,
          data: {},
          overrideAccess: false,
          user: principal,
          context: { disableRevalidate: true },
        }),
      ).rejects.toThrow()
    }
    await payload.delete({ collection: 'payload-mcp-api-keys', id: keyDoc.id })
    await payload.delete({ collection: 'users', id: owner.id })
  })

  it('realny editor NADAL zapisuje globala (bot MCP ma pisać treść)', async () => {
    const payload = await getTestPayload()
    const editor = await payload.create({
      collection: 'users',
      data: {
        name: 'Glob Editor',
        email: uniqueEmail('globeditor'),
        password: 'test1234',
        role: 'editor',
      },
    })
    const updated = await payload.updateGlobal({
      slug: 'header',
      data: {},
      overrideAccess: false,
      user: editor,
      context: { disableRevalidate: true },
    })
    expect(updated).toBeTruthy()
    await payload.delete({ collection: 'users', id: editor.id })
  })

  it('surowy klucz MCP nie czyta form-submissions (leady to PII)', async () => {
    const payload = await getTestPayload()
    const { owner, keyDoc, principal } = await makeKeyPrincipal(payload)
    await expect(
      payload.find({ collection: 'form-submissions', overrideAccess: false, user: principal }),
    ).rejects.toThrow()
    await payload.delete({ collection: 'payload-mcp-api-keys', id: keyDoc.id })
    await payload.delete({ collection: 'users', id: owner.id })
  })

  // Kolekcje rdzenia Payloada: dokładane w sanitizeConfig (po pluginach) z defaultAccess.
  it('surowy klucz MCP nie rusza payload-folders (Media ma folders: true)', async () => {
    const payload = await getTestPayload()
    const { owner, keyDoc, principal } = await makeKeyPrincipal(payload)
    await expect(
      payload.find({ collection: 'payload-folders', overrideAccess: false, user: principal }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'payload-folders',
        data: { name: 'via raw key', folderType: ['media'] },
        overrideAccess: false,
        user: principal,
      }),
    ).rejects.toThrow()
    // Realny editor dalej widzi foldery (panel admina musi działać).
    const asEditor = await payload.find({
      collection: 'payload-folders',
      overrideAccess: false,
      user: owner,
      limit: 1,
    })
    expect(asEditor.docs).toBeInstanceOf(Array)
    await payload.delete({ collection: 'payload-mcp-api-keys', id: keyDoc.id })
    await payload.delete({ collection: 'users', id: owner.id })
  })

  it('surowy klucz MCP nie rusza payload-locked-documents', async () => {
    const payload = await getTestPayload()
    const { owner, keyDoc, principal } = await makeKeyPrincipal(payload)
    await expect(
      payload.find({
        collection: 'payload-locked-documents',
        overrideAccess: false,
        user: principal,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'payload-locked-documents',
        data: { globalSlug: 'header', user: { relationTo: 'users', value: owner.id } },
        overrideAccess: false,
        user: principal,
      }),
    ).rejects.toThrow()
    await payload.delete({ collection: 'payload-mcp-api-keys', id: keyDoc.id })
    await payload.delete({ collection: 'users', id: owner.id })
  })
})

describe('seed: czyszczenie kluczy MCP przed userami', () => {
  // payload_mcp_api_keys.user_id jest NOT NULL, a FK ma ON DELETE SET NULL — bez
  // wcześniejszego skasowania kluczy drugi przebieg seeda wywracał się na userach.
  it('usunięcie usera z podpiętym kluczem pada, po skasowaniu kluczy przechodzi', async () => {
    const payload = await getTestPayload()
    const user = await payload.create({
      collection: 'users',
      data: {
        name: 'Keyed User',
        email: uniqueEmail('keyed'),
        password: 'test1234',
        role: 'editor',
      },
    })
    const keyDoc = await payload.create({
      collection: 'payload-mcp-api-keys',
      data: { user: user.id, label: 'seed clash' },
    })
    await expect(payload.delete({ collection: 'users', id: user.id })).rejects.toThrow()
    await payload.delete({
      collection: 'payload-mcp-api-keys',
      where: { id: { equals: keyDoc.id } },
    })
    const deleted = await payload.delete({ collection: 'users', id: user.id })
    expect(deleted.id).toBe(user.id)
  })
})

describe('publiczne ścieżki pluginów (regresja po domknięciu zapisów)', () => {
  // Domykając create/update/delete w redirects/forms/search i read w form-submissions
  // łatwo przykryć całym blokiem `access` publiczne `read`, które plugin dawał
  // domyślnie — front i formularze przestałyby działać dla anonima. Ten test
  // pilnuje kolejności merge'a: user === null musi dalej przechodzić.
  it('anonim wysyła formularz (create form-submissions)', async () => {
    const payload = await getTestPayload()
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: `Public form ${Date.now()}`,
        fields: [{ blockType: 'text', name: 'imie', label: 'Imię', required: true }],
        // redirect zamiast message — 'message' wymaga richTextu, a fixture ma tylko
        // dowieźć formularz, w który anonim może strzelić.
        confirmationType: 'redirect',
        redirect: { url: '/' },
      },
    })
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: form.id,
        submissionData: [{ field: 'imie', value: 'Anonim' }],
      },
      overrideAccess: false,
      user: null,
    })
    expect(submission.id).toBeTruthy()
    await payload.delete({ collection: 'form-submissions', id: submission.id })
    await payload.delete({ collection: 'forms', id: form.id })
  })

  it('anonim czyta redirects, forms i search (front renderuje bez sesji)', async () => {
    const payload = await getTestPayload()
    for (const collection of ['redirects', 'forms', 'search'] as const) {
      const result = await payload.find({ collection, overrideAccess: false, user: null, limit: 1 })
      expect(result.docs).toBeInstanceOf(Array)
    }
  })
})

describe('markdownToLexical', () => {
  it('converts markdown to lexical editor state', async () => {
    const payload = await getTestPayload()
    const result = await markdownToLexical(payload, '# Heading\n\nSome **bold** text.')
    expect(result).toHaveProperty('root')
    const json = JSON.stringify(result)
    expect(json).toContain('heading')
    expect(json).toContain('Some ')
  })
})
