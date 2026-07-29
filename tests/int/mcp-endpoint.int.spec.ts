import { describe, expect, it } from 'vitest'

const BASE = process.env.MCP_TEST_URL || 'http://localhost:3000'

const rpc = (method: string, params: object = {}) => ({
  jsonrpc: '2.0',
  id: '1',
  method,
  params,
})

describe('MCP endpoint auth', () => {
  // Accept z text/event-stream jest wymagany przez transport Streamable HTTP —
  // bez niego serwer może odpowiedzieć 406 i testy auth "przechodziłyby"
  // z niewłaściwego powodu.
  const ACCEPT = 'application/json, text/event-stream'

  it('rejects request without an API key', async () => {
    const res = await fetch(`${BASE}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: ACCEPT },
      body: JSON.stringify(rpc('tools/list')),
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).not.toBe(406)
  })

  it('rejects request with a bogus API key', async () => {
    const res = await fetch(`${BASE}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: ACCEPT,
        Authorization: 'Bearer definitely-not-a-key',
      },
      body: JSON.stringify(rpc('tools/list')),
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).not.toBe(406)
  })
})
