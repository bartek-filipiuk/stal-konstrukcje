/**
 * Tworzy klucz API dla serwera MCP bez wchodzenia do panelu.
 *
 * Uruchomienie:  pnpm payload run scripts/create-mcp-key.ts [label]
 * Opcjonalnie:   MCP_BOT_EMAIL=... (domyślnie mcp-agent@localhost.local)
 *
 * Kolekcja kluczy jest zamknięta na admina (patrz src/plugins/mcp.ts), a wszystkie
 * uprawnienia per-klucz startują z `false` — odklikanie ich w panelu to kilkanaście
 * checkboxów i łatwo o pominięcie. Skrypt ustawia dokładnie ten zakres, który
 * wystawia plugin. Klucz jest drukowany RAZ; potem w bazie leży zaszyfrowany.
 */
import { randomUUID } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

const crud = { find: true, create: true, update: true, delete: true }
const globalAccess = { find: true, update: true }

const email = process.env.MCP_BOT_EMAIL || 'mcp-agent@localhost.local'
const label = process.argv[2] || 'MCP client'

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
})
const user = docs[0]
if (!user) throw new Error(`Nie ma usera ${email} — odpal seed albo podaj MCP_BOT_EMAIL.`)
// Klucz działa JAKO ten user; admin dałby botowi prawo do users i kluczy API.
if (user.role === 'admin') throw new Error(`${email} jest adminem — klucz MCP pinujemy do editora.`)

const apiKey = randomUUID()
const doc = await payload.create({
  collection: 'payload-mcp-api-keys',
  data: {
    user: user.id,
    label,
    enableAPIKey: true,
    apiKey,
    pages: crud,
    posts: crud,
    categories: crud,
    media: crud,
    redirects: crud,
    forms: crud,
    formSubmissions: { find: true },
    header: globalAccess,
    footer: globalAccess,
    siteSettings: globalAccess,
    'payload-mcp-tool': { uploadMediaFromUrl: true, markdownToRichText: true },
    'payload-mcp-resource': { contentGuide: true },
  },
})

console.log(`Klucz #${doc.id} dla ${email} (${label}):\n${apiKey}`)
process.exit(0)
