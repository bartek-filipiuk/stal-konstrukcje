import { describe, expect, it, beforeAll, vi } from 'vitest'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { getTestPayload, uniqueEmail } from './helpers'

// Route /next/seed czyta nagłówki przez next/headers — poza requestem Next trzeba je podstawić.
const mocked = vi.hoisted(() => ({ headers: new Headers() }))
vi.mock('next/headers', () => ({ headers: async () => mocked.headers }))

let payload: Payload
let admin: User
let editor: User
const editorPassword = 'test1234'

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await payload.create({
    collection: 'users',
    data: { name: 'Test Admin', email: uniqueEmail('admin'), password: 'test1234', role: 'admin' },
  })
  editor = await payload.create({
    collection: 'users',
    data: {
      name: 'Test Editor',
      email: uniqueEmail('editor'),
      password: editorPassword,
      role: 'editor',
    },
  })
})

describe('role-based access', () => {
  it('editor cannot create users', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { name: 'X', email: uniqueEmail('x'), password: 'test1234', role: 'editor' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('editor cannot change own role', async () => {
    // Field-level access na role przy overrideAccess:false: Payload zwykle
    // po cichu wycina pole z zapisu, ale może też rzucić — obie ścieżki są OK,
    // inwariant brzmi: rola w bazie ma zostać 'editor'.
    try {
      await payload.update({
        collection: 'users',
        id: editor.id,
        data: { role: 'admin' },
        overrideAccess: false,
        user: editor,
      })
    } catch {
      // odrzucenie całego update też spełnia inwariant
    }
    const fresh = await payload.findByID({ collection: 'users', id: editor.id })
    expect(fresh.role).toBe('editor')
  })

  it('editor cannot update another user (przejęcie konta)', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: admin.id,
        data: { email: uniqueEmail('hijack'), password: 'hijacked1234' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('editor can update own name', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { name: 'Renamed Editor' },
      overrideAccess: false,
      user: editor,
    })
    expect(updated.name).toBe('Renamed Editor')
  })

  it('editor cannot delete users', async () => {
    await expect(
      payload.delete({
        collection: 'users',
        id: admin.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('admin can create users', async () => {
    const u = await payload.create({
      collection: 'users',
      data: { name: 'Y', email: uniqueEmail('y'), password: 'test1234', role: 'editor' },
      overrideAccess: false,
      user: admin,
    })
    expect(u.role).toBe('editor')
    await payload.delete({ collection: 'users', id: u.id })
  })

  it('editor can update pages (content stays writable)', async () => {
    const page = await payload.find({ collection: 'pages', limit: 1 })
    if (page.docs.length === 0) return // brak seedu w testowej bazie — pomiń
    const doc = page.docs[0]
    const updated = await payload.update({
      collection: 'pages',
      id: doc.id,
      data: { title: doc.title },
      overrideAccess: false,
      user: editor,
      draft: true,
      // Hook revalidatePage woła next/cache poza requestem Next — vitest by wybuchł.
      // Ten sam wyłącznik stosuje src/endpoints/seed. Nie dotyka warstwy access.
      context: { disableRevalidate: true },
    })
    expect(updated.id).toBe(doc.id)
  })
})

describe('/next/seed guard', () => {
  // ponytail: tylko ścieżki 403 (anonim + editor) — to jest inwariant bezpieczeństwa.
  // Pozytywnego przypadku admina nie testujemy, bo przejście guardu odpala PRAWDZIWY seed
  // i wyczyściłby dev-bazę.
  const callSeed = async () => {
    const { POST } = await import('@/app/(frontend)/next/seed/route')
    // Target: POST bierze Request (bramka SEED_SECRET dla produkcji) — typy tras Next
    // nie przepuszczają opcjonalnego parametru, więc test podaje pusty request.
    return POST(new Request('http://localhost/next/seed'))
  }

  it('anonymous request gets 403', async () => {
    mocked.headers = new Headers()
    expect((await callSeed()).status).toBe(403)
  })

  it('editor request gets 403', async () => {
    const { token } = await payload.login({
      collection: 'users',
      data: { email: editor.email, password: editorPassword },
    })
    expect(token).toBeTruthy()
    mocked.headers = new Headers({ Authorization: `JWT ${token}` })
    expect((await callSeed()).status).toBe(403)
  })
})
