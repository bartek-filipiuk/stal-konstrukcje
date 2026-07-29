import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

let cached: Payload | null = null

export async function getTestPayload(): Promise<Payload> {
  if (!cached) {
    cached = await getPayload({ config })
  }
  return cached
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`
}
