#!/usr/bin/env node
/**
 * Generowanie obrazów hero przez Replicate (black-forest-labs/flux-1.1-pro-ultra).
 *
 * Dlaczego ten model: najlepszy fotorealizm na Replicate, tryb `raw` daje
 * naturalny, "reporterski" wygląd (bez plastiku AI), natywne aspect ratio
 * do 21:9 — bez generowania 3:2 i przycinania.
 *
 * Użycie:  node scripts/generate-images.mjs            # generuje brakujące
 *          node scripts/generate-images.mjs --force    # nadpisuje istniejące
 * Wymaga:  REPLICATE_API_TOKEN w .env
 * Wynik:   src/endpoints/seed/images/*.jpg  (seed wgrywa je do kolekcji media)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'src/endpoints/seed/images')
const force = process.argv.includes('--force')

// --- token: env procesu → .env projektu → globalne ~/.claude/settings.json (blok env) ---
function resolveToken() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN
  try {
    const env = readFileSync(resolve(root, '.env'), 'utf8')
    const m = env.match(/^REPLICATE_API_TOKEN=(.+)$/m)
    if (m) return m[1].trim()
  } catch {}
  try {
    const settings = JSON.parse(
      readFileSync(resolve(process.env.HOME || '', '.claude/settings.json'), 'utf8'),
    )
    if (settings?.env?.REPLICATE_API_TOKEN) return settings.env.REPLICATE_API_TOKEN
  } catch {}
  return null
}
const token = resolveToken()
if (!token) {
  console.error(
    'BRAK REPLICATE_API_TOKEN — dodaj w ~/.claude/settings.json (blok "env") albo w .env projektu.',
  )
  process.exit(1)
}

/**
 * Specyfikacje obrazów. Zasady promptów (nie psuj ich przy edycji):
 * - język fotografii (obiektyw, światło, kadr), nie język ilustracji
 * - kompozycja pod tekst: treść strony jest PO LEWEJ → obiekt po PRAWEJ, lewa ciemniejsza
 * - twarz zakryta maską spawalniczą = zero problemu "uncanny AI face"
 * - jedyne ciepłe światło = iskry/łuk (spójne z akcentem #F26419)
 * - zakazy na końcu prompta: bez tekstu, logo, znaków wodnych
 */
const SPECS = [
  {
    file: 'hero-home.jpg',
    aspect_ratio: '21:9',
    prompt:
      'Documentary photograph inside a steel fabrication workshop at night. A welder in dark ' +
      'work gear and a closed welding helmet works on a large raw steel beam positioned in the ' +
      'right half of the frame, a burst of bright orange sparks flying from the weld point, ' +
      'thin smoke haze catching the light. Left half of the frame falls into deep graphite ' +
      'shadow with faint silhouettes of steel profiles and hall structure. Single warm light ' +
      'source from the welding arc, cold dim ambient fill, heavy contrast, moody low-key ' +
      'lighting. Shot on 35mm lens, eye level, slight grain, muted colors except the orange ' +
      'sparks. No text, no logos, no watermarks, no visible faces.',
  },
  {
    file: 'steel-detail.jpg',
    aspect_ratio: '16:9',
    prompt:
      'Macro photograph of a fresh TIG weld seam on a raw graphite-grey steel profile, ' +
      'shallow depth of field, the weld bead sharp in the right third of the frame, ' +
      'background dissolving into dark blur. Cold industrial side light with a faint warm ' +
      'reflection, fine metal texture, brushed steel surface, subtle machining marks. ' +
      'Dark, moody, almost monochrome with graphite tones. Shot with 100mm macro lens. ' +
      'No text, no logos, no watermarks, no people.',
  },
]

const API = 'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro-ultra/predictions'

async function generate(spec) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait', // czekaj synchronicznie (do ~60s)
    },
    body: JSON.stringify({
      input: {
        prompt: spec.prompt,
        aspect_ratio: spec.aspect_ratio,
        output_format: 'jpg',
        raw: true, // tryb fotograficzny — mniej "AI look"
        safety_tolerance: 2,
      },
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  let prediction = await res.json()

  // dopoll, jeśli Prefer:wait nie domknął
  while (['starting', 'processing'].includes(prediction.status)) {
    await new Promise((r) => setTimeout(r, 3000))
    const poll = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${token}` },
    })
    prediction = await poll.json()
  }
  if (prediction.status !== 'succeeded') {
    throw new Error(`status=${prediction.status} error=${prediction.error}`)
  }

  const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output
  const img = await fetch(url)
  if (!img.ok) throw new Error(`download HTTP ${img.status}`)
  writeFileSync(resolve(outDir, spec.file), Buffer.from(await img.arrayBuffer()))
}

mkdirSync(outDir, { recursive: true })
let failed = 0
for (const spec of SPECS) {
  const target = resolve(outDir, spec.file)
  if (existsSync(target) && !force) {
    console.log(`= ${spec.file} istnieje (użyj --force aby nadpisać)`)
    continue
  }
  process.stdout.write(`> ${spec.file} (${spec.aspect_ratio}) ... `)
  try {
    await generate(spec)
    console.log('OK')
  } catch (e) {
    failed++
    console.log(`BŁĄD: ${e.message}`)
  }
}
process.exit(failed ? 1 : 0)
