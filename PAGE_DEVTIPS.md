# Development Tips & Gotchas

> **Note:** For the main customization workflow, see `SETUP_PROMPT.md`. This file contains quick fixes and gotchas.

Quick reference for common issues and patterns when customizing this boilerplate.

---

## Files to Update for New Site

| What | File | Notes |
|------|------|-------|
| Logo text | `.env` | Set `NEXT_PUBLIC_SITE_NAME` environment variable |
| Site name (SEO) | `src/plugins/index.ts` | `SITE_NAME` constant |
| Theme colors | `src/app/(frontend)/theme.css` | HSL format without `hsl()` wrapper |
| Seed data | `src/endpoints/seed/index.ts` | Pages, navigation, settings |
| Home fallback | `src/endpoints/seed/home-static.ts` | Must exist (even empty) |

---

## Common Issues & Fixes

### 1. "Module not found: home-static"
**Problem**: `src/app/(frontend)/[slug]/page.tsx` imports `homeStatic`
**Fix**: Create `src/endpoints/seed/home-static.ts`:
```typescript
import type { RequiredDataFromCollectionSlug } from 'payload'

export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  id: 0,
  title: 'Home',
  slug: 'home',
  hero: { type: 'none' },
  layout: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### 2. CSS @layer Error
**Problem**: `@layer components` in theme.css fails
**Fix**: Don't use `@layer` directives in theme.css - only use them in globals.css which has `@tailwind` directives

### 3. Link Field Validation Errors
**Problem**: "Document to link to" or "Label" required even for custom URLs
**Fix**: In `src/fields/link.ts`, ensure `required: false` on conditional fields:
```typescript
{ name: 'reference', required: false, ... }
{ name: 'url', required: false, ... }
{ name: 'label', required: false, ... }
```

### 4. Seed Route 403 Forbidden
**Problem**: `/next/seed` requires authentication
**Fix**: For development, simplify `src/app/(frontend)/next/seed/route.ts`:
```typescript
export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const payloadReq = await createLocalReq({}, payload)
  await seed({ payload, req: payloadReq })
  return Response.json({ success: true })
}

export async function GET(): Promise<Response> {
  return POST()
}
```

### 5. Content Invisible on Page
**Problem**: ScrollReveal animations keep content at `opacity: 0`
**Cause**: IntersectionObserver hasn't triggered
**Note**: Content appears when user scrolls - this is expected behavior

---

## Data Structures

### HSL Colors (theme.css)
```css
/* Format: H S% L% (no hsl wrapper, no commas) */
--primary: 220 70% 25%;
--secondary: 30 95% 50%;
```

### Rich Text (Lexical format)
> See PAGE_BOILERPLATE.md for complete `createRichText` helper function.

```typescript
// Quick reference - use createRichText('Your text here')
createRichText('Your paragraph text')
```

### Link Field
```typescript
// Internal link
{ type: 'reference', reference: { relationTo: 'pages', value: pageId }, label: 'Click' }

// External link
{ type: 'custom', url: '/path', label: 'Click' }

// Phone link
{ type: 'custom', url: 'tel:+48123456789', label: 'Call Us' }
```

### Feature Item
```typescript
{
  icon: 'star', // calendar|book|users|star|code|globe|heart|lightning
  title: 'Feature Title',
  description: 'Feature description text',
}
```

---

## Quick Commands

```bash
# Reset database (when schema conflicts)
psql -U postgres -c "DROP DATABASE payload; CREATE DATABASE payload;"

# Regenerate types after schema changes
pnpm generate:types

# Clear Next.js cache
rm -rf .next && pnpm dev

# Trigger seed (browser)
http://localhost:3000/next/seed
```

---

## Seed Data Checklist

1. Admin user (email + password)
2. Home page (slug: 'home')
3. Other pages (unique slugs)
4. Header global (navItems array)
5. Footer global (navItems + social enabled)
6. Site-settings global (siteName, contact, social URLs)

---

## Accessibility Quick Reference

### Text Over Images - CRITICAL

ALWAYS add overlay when placing text on images:

```css
/* Method 1: Gradient overlay (RECOMMENDED) */
.hero-background {
  background:
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)),
    url('/image.jpg') center/cover;
}

/* Method 2: Pseudo-element overlay */
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* Method 3: Text container background */
.hero-content {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 2rem;
}
```

### WCAG Contrast Requirements

| Element | Minimum Ratio | Example |
|---------|---------------|---------|
| Body text | 4.5:1 | Dark gray on white |
| Large text (18px+) | 3:1 | Headlines |
| UI components | 3:1 | Buttons, icons |

### Minimum Sizes

| What | Min | Why |
|------|-----|-----|
| Touch targets | 44x44px | Mobile accessibility |
| Body font | 16px | Readability |
| Small text | 14px | Never go below |
| H1 headlines | 32px | Visual hierarchy |
| H2 headlines | 24px | Visual hierarchy |
| Line height | 1.5 | Text legibility |

### Contrast Testing Tools

- Browser DevTools → Accessibility panel
- WebAIM: https://webaim.org/resources/contrastchecker/
- Lighthouse audit (Chrome DevTools)

### Quick Console Check
```javascript
// Get computed styles
getComputedStyle(element).color
getComputedStyle(element).backgroundColor
```

---

## Field Notes: stal-konstrukcje session (2026-07)

Real obstacles hit while building a full site on this boilerplate. Check these BEFORE starting a new site — each one cost debugging time.

### A. Dark-first theme requires THREE files, not one

**Problem**: Setting `defaultTheme = 'dark'` in `src/providers/Theme/shared.ts` did nothing.
**Cause**: `defaultTheme` has TWO sources of truth — `shared.ts` AND `ThemeSelector/types.ts`. `InitTheme` imports from **ThemeSelector/types**. On top of that, both `InitTheme` and `ThemeProvider` prefer the OS color scheme over `defaultTheme`, so a light-OS visitor always gets light.
**Fix** (for a dark-first brand):
1. `src/providers/Theme/ThemeSelector/types.ts` → `defaultTheme = 'dark'`
2. `src/providers/Theme/shared.ts` → same (keep in sync)
3. In `InitTheme/index.tsx` AND `providers/Theme/index.tsx`: remove the `getImplicitPreference()` fallback — keep only localStorage check, else default.

### B. Custom CSS variables must live INSIDE the palette blocks

**Problem**: `--surface-deep` defined in separate `[data-theme='dark'] {}` then `:root {}` blocks → dark mode got the LIGHT value.
**Cause**: `:root` and `[data-theme='dark']` have equal specificity — source order wins. A later `:root` block overrides an earlier dark block.
**Fix**: Define every custom variable inside the SAME two palette blocks at the top of theme.css (Section 1 `:root`, Section 2 `[data-theme='dark']`). Never add palette variables further down the file.

### C. Components are NOT fully blank canvas — utility classes fight theme.css

Hardcoded utilities found in components that override or resist theme.css:
| Component | Hardcoded | Consequence |
|-----------|-----------|-------------|
| `GlassHero/Component.tsx` | `text-center`, `bg-background` on `.hero-background`, `opacity-80` on subheadline | Left-aligned hero impossible without editing component; theme background needs higher specificity |
| `Features/Component.tsx` | `bg-primary text-primary-foreground` on `.feature-icon`, `rounded-xl` | Icon color scheme fixed |
| Hero CTAs | `rounded-lg` | Sharp/industrial radius needs override |

**Fix pattern**: bump specificity in theme.css (`.hero-section .hero-background { ... }`) — same specificity loses to utilities loaded later. Long-term: strip color/alignment utilities from components (see DESIGN_IMPROVEMENTS.md).

### D. Features block link bug (pre-existing)

**Problem**: Card links never render; 3 tsc errors.
**Cause**: `Features/Component.tsx` read `feature.link?.label`, but config defines `linkUrl` + `linkLabel`.
**Fix**: read `feature.linkUrl && feature.linkLabel`, render `<CMSLink type="custom" url={feature.linkUrl}>`. (Fixed in this repo — verify when cloning boilerplate.)

### E. Seed typing recipe (Payload 3 + generated types)

Four traps when writing `seed/index.ts`:
1. **`payload.create` overload inference breaks** when layout arrays mix inline literals with extracted consts. Fix: typed helper —
   ```typescript
   const createPage = (data: Omit<RequiredDataFromCollectionSlug<'pages'>, 'hero'>) =>
     payload.create({ collection: 'pages', data: { hero: { type: 'none' }, ...data } })
   ```
2. **`Page.hero` is REQUIRED by the type** even when you only use layout blocks → inject `hero: { type: 'none' }` (runtime default exists, type doesn't know).
3. **Extracted shared blocks** need explicit annotation: `NonNullable<Page['layout']>[number]`.
4. **Nav reference `value` must be `number`** — a `number | string` param type fails assignment.
Also: `createRichText` needs `direction: 'ltr' as const` (plain `string` fails the Lexical union).

### F. SEO title is hardcoded in TWO utils — SITE_NAME is not enough

**Problem**: `<title>` stayed "Payload Website Template" after setting `SITE_NAME` in `src/plugins/index.ts` and `.env`.
**Cause**: `src/utilities/generateMeta.ts` and `src/utilities/mergeOpenGraph.ts` hardcode the template name (plugins SITE_NAME only covers admin-panel-generated meta).
**Fix**: read `process.env.NEXT_PUBLIC_SITE_NAME` in both utils. Grep check: `grep -rn "Payload Website Template" src/` must return nothing.

### G. Tailwind fontFamily pointed at dead variables

`tailwind.config.mjs` shipped with `var(--font-geist-mono)` / `var(--font-geist-sans)` — variables that no file defines (layout used `--font-space-grotesk`). Silent fallback to system fonts. When swapping fonts in `layout.tsx`, update `tailwind.config.mjs` `fontFamily` to the SAME variable names, and keep `globals.css` body rule in sync.

### H. Polish diacritics: verify `latin-ext` per font

Not every Google Font has `latin-ext` (e.g. Space Mono doesn't) — "REALIZACJĘ", "PROMIEŃ" render as tofu. Always pass `subsets: ['latin', 'latin-ext']` in `next/font` AND verify the family supports it (fonts.google.com → glyphs). Safe mono with PL glyphs: JetBrains Mono.

### I. prefers-reduced-motion + animation-delay = hidden content

globals.css zeroes animation-duration, but an element with `animation: reveal 0.7s ease-out 0.5s both` still waits out the DELAY at opacity 0. Add explicit overrides in theme.css:
```css
@media (prefers-reduced-motion: reduce) {
  .hero-content { animation: none; opacity: 1; transform: none; }
}
```

### J. Dev port drift

Next silently falls back 3000 → 3002 when the port is busy (`⚠ Port 3000 is in use`). Before seeding/verifying, read the actual port from dev output — seed hitting the wrong port = another app's DB gets seeded or connection refused.

### K. Known pre-existing tsc errors (boilerplate noise — don't chase)

`tsc --noEmit` fails on these even on a clean clone: `Footer/Component.tsx` (globals typing), `Header/Nav/index.tsx` (`onClick` not on CMSLink), `en/posts|search/page.tsx` (metadata re-export), `seed/home-static.ts` (`direction: string`). Budget: ~7 errors that are NOT yours. Verify your own files with a grep filter over the tsc log.

### L. Hardcoded EN strings + logo truncation

- `Logo.tsx`: `max-w-[12rem]` truncates longer site names ("STALMET Konstruk…") — widen or shrink font for long `NEXT_PUBLIC_SITE_NAME`.
- `Footer/Component.tsx`: headings "Navigation" / "Contact" hardcoded in English.
- `ThemeSelector`: "Auto" label hardcoded.
For Polish sites, localize these three places (or wire them to i18n).

### N. Zombie dev servers → `__webpack_modules__[moduleId] is not a function`

**Symptom**: subpages randomly 500 with `__webpack_modules__[moduleId] is not a function`
(stack in RichText/RenderHero/anything), or `/api/users/me` 500, while other pages work.
**Root cause**: orphaned `next-server` processes. Killing dev with `lsof -ti:PORT | xargs kill`
kills the pnpm/cross-env PARENT but the `next-server` CHILD survives, keeps the port,
and serves stale (or deleted!) `.next` chunks. Over a session this project had FIVE
zombies on ports 3000/3002/3003/3004/3005 — including the "unknown process" that
occupied 3000 from the start.
**Detection** (lsof lies here — use ss):
```bash
ss -tlnp | grep -E ":300[0-9] "        # who REALLY listens
pgrep -af "next"                        # all next processes
```
**Cure** — kill by project cwd, then clean cache, then ONE fresh server:
```bash
for pid in $(pgrep -f next); do
  readlink /proc/$pid/cwd 2>/dev/null | grep -q "<PROJECT-DIR>" && kill -9 $pid
done
rm -rf .next && PORT=<PORT> pnpm dev
```
**Fast verification — `scripts/smoke.sh PORT [devlog]`**: every page 2× (first pass
compiles the route, second catches stale-chunk errors) + grep of dev log for
`__webpack_modules__` / upstream-image failures. Run it after EVERY restart and
before showing anything to the user. Exit code != 0 = do the cure above.

### M. Fastest verification loop that worked

```bash
docker compose up -d && until docker compose exec -T postgres pg_isready -U postgres; do sleep 1; done
pnpm dev &        # note the ACTUAL port from output
curl -s http://localhost:PORT/next/seed          # {"success":true}
for p in "" oferta realizacje o-firmie kontakt; do curl -s -o /dev/null -w "/$p %{http_code}\n" http://localhost:PORT/$p; done
# then: real screenshot (browser MCP) — HTML 200 ≠ correct theme; the light/dark bug was only visible on screenshot
```
