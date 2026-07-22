import { createLocalReq, getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import config from '@payload-config'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

// Seed KASUJE i odtwarza całą treść. W produkcji wymaga sekretu:
//   curl -X POST "https://domena/next/seed?secret=$SEED_SECRET"
// Bez SEED_SECRET w env produkcyjny seed jest wyłączony całkowicie.
function isAuthorized(request: Request): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  const secret = process.env.SEED_SECRET
  if (!secret) return false
  const url = new URL(request.url)
  return url.searchParams.get('secret') === secret
}

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response('Forbidden', { status: 403 })
  }
  const payload = await getPayload({ config })

  try {
    const payloadReq = await createLocalReq({}, payload)
    await seed({ payload, req: payloadReq })
    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
    return new Response('Error seeding data.', { status: 500 })
  }
}

export async function GET(request: Request): Promise<Response> {
  return POST(request)
}
