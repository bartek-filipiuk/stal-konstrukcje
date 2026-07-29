# DEPLOYTIPS — dlaczego deploy zajął 2h i jak następnym razem zrobić to w 20 minut

> Wnioski z pierwszego deployu STALMET na Coolify (2026-07-23, cool.qaci.pl, v4.0.0-beta.462).
> 3 nieudane podejścia + osobna walka o trwałość mediów. KAŻDY z tych problemów da się
> wyeliminować PRZED pierwszym deployem — stąd checklista na końcu.

---

## 1. Co pożarło czas (chronologicznie, z przyczyną)

### ~20 min — lokalny build wisiał w nieskończoność
`prodMigrations` w adapterze odpalały się podczas `next build` (build ustawia
`NODE_ENV=production`), na deweloperskiej bazie zbudowanej push-modem → zakleszczenie.
**Fix:** bramka env — `prodMigrations: process.env.PAYLOAD_MIGRATE === 'true' ? migrations : undefined`;
`PAYLOAD_MIGRATE=true` tylko jako runtime env w Coolify, nigdy build-time.

### Deploy #1 padł — pnpm 11 vs engines
Corepack w kontenerze ściągnął **najnowszego** pnpm (11.x), a `engines` w package.json
wymaga `^9 || ^10`. Lokalnie działało, bo mamy 10.24.
**Fix:** `"packageManager": "pnpm@10.24.0"` w package.json — corepack to respektuje.
Reguła: **pinuj packageManager w dniu startu projektu**, nie w dniu deployu.

### Deploy #2 padł — prerender chce bazy, której w buildzie nie ma
`generateStaticParams` w `[slug]`/`posts/*` inicjuje Payloada w trakcie builda →
w Dockerze brak `PAYLOAD_SECRET` i bazy → `missing secret key`. Lokalnie przechodziło,
bo `next build` czyta `.env` (dev-baza działała) — **lokalny build kłamie**.
**Fix:** `export const dynamic = 'force-dynamic'` w layout (frontend) + USUNIĘTE
wszystkie `generateStaticParams` (force-dynamic ich NIE wyłącza — dalej odpalają się
w buildzie!). Strona SSR — dla lokalnego biznesu koszt zerowy, build hermetyczny.

### ~30 min — trwałość mediów (3 ślepe uliczki)
1. API `/applications/{uuid}/storages` → **404** (beta.462 nie ma storage w API).
2. `custom_docker_run_options: "-v vol:/path"` → przyjęte bez błędu i **cicho zignorowane**
   (docs: `-v/--volume` NIE jest na liście wspieranych flag — tylko --cap-add, --gpus itd.).
3. Jedyna droga w tej wersji: **Persistent Storage w UI** (Application → Storages) — klik użytkownika.
**Reguła:** wolumen na `/app/public/media` konfigurujemy W UI PRZED pierwszym deployem;
dowód trwałości = redeploy bez ponownego seedu + `curl` pliku → 200.

### Drobnica, która też kosztowała rundy
- Coolify API per wersja zmienia nazwy pól: `is_build_time` → **`is_buildtime`**,
  `fqdn` w PATCH → **`domains`**. Reguła: pierwszy call próbny, dopiero potem batch.
- `NEXT_PUBLIC_*` wypiekają się w buildzie → Dockerfile musi mieć **`ARG` + `ENV`**
  w stage builder, inaczej --build-arg z Coolify jest ignorowany.
- `postbuild` woła `next-sitemap --config next-sitemap.config.cjs`, a pliku nie było
  w boilerplacie → build umiera na ostatnim kroku.
- Obrazy seedu w `src/.../images/` nie wchodzą do standalone (trace tylko importów) →
  katalog `seed-images/` w root + `COPY` w Dockerfile + ścieżka z `process.cwd()`.
- Named volume dziedziczy ownership z obrazu przy PIERWSZYM montażu → w Dockerfile
  `RUN mkdir -p public/media && chown nextjs:nodejs public/media`, inaczej Payload
  nie zapisze (kontener działa jako nextjs, wolumen byłby roota).
- Seed endpoint bez guardu na prodzie = każdy może skasować treść →
  `SEED_SECRET` (403 bez `?secret=`), w dev bez zmian.
- Równoległe `deleteMany` w seedzie (Promise.all) → **deadlock Postgresa**, gdy pages
  referencują media. Kasowanie kolekcji sekwencyjnie.

## 2. Kluczowa lekcja: jedna komenda-brama przed pierwszym deployem

**Lokalny build z `.env` NIE dowodzi, że build przejdzie w Dockerze.** Symulacja
warunków Coolify (bez bazy, bez sekretów) wyłapałaby deploye #2 od razu:

```bash
mv .env .env.bak && rm -rf .next \
  && NEXT_PUBLIC_SERVER_URL=https://DOMENA NEXT_PUBLIC_SITE_NAME="NAZWA" pnpm build; \
  EXIT=$?; mv .env.bak .env; echo "HERMETIC BUILD EXIT=$EXIT"
```

Exit 0 = build przejdzie w Coolify. To jest **brama**: bez zielonego wyniku nie tykamy API.

## 3. Checklista następnego deployu (~20 min zamiast 2h)

Wszystkie fixy z sekcji 1 są już w tym repo — po backporcie do boilerplate'u punkty
1–7 są "za darmo" i zostaje tylko 8–14.

**Przed Coolify (w repo):**
1. [ ] `packageManager` przypięty w package.json
2. [ ] `prodMigrations` z bramką `PAYLOAD_MIGRATE` + świeża migracja (`pnpm payload migrate:create`)
3. [ ] `force-dynamic` na layout (frontend), zero `generateStaticParams`
4. [ ] Dockerfile: `ARG/ENV NEXT_PUBLIC_*`, `COPY seed-images`, `chown public/media`
5. [ ] Guard `SEED_SECRET` na `/next/seed`
6. [ ] `next-sitemap.config.cjs` istnieje
7. [ ] **Hermetyczny build (komenda wyżej) = EXIT 0**
8. [ ] Commit + push (repo publiczne = zero konfiguracji deploy-keys)

**W Coolify (API, kolejność bez czekania na błędy):**
9. [ ] Projekt + app (`/applications/public`, build_pack dockerfile, port 3000) + Postgres
10. [ ] **Persistent Storage w UI: `/app/public/media` — PRZED pierwszym deployem** (API beta.462 tego nie ma)
11. [ ] Envy jednym batchem — pola: `is_buildtime` (true TYLKO dla NEXT_PUBLIC_*); domena przez PATCH `{"domains": "https://…"}`; wcześniej 1 call próbny
12. [ ] Deploy + poll; przy fail → `/deployments/{uuid}` i grep logów po `ERROR`
13. [ ] Seed raz: `curl "https://DOMENA/next/seed?secret=$SEED_SECRET"`
14. [ ] **Dowód trwałości mediów:** redeploy → `curl /api/media/file/...` → 200 bez ponownego seedu

## 4. Co rozważyć w boilerplacie długoterminowo

- **S3/R2 zamiast dysku na media** (`@payloadcms/storage-s3`) — znika cały problem
  wolumenu, media przeżywają nawet zmianę serwera; jedna zmienna env więcej.
  Dla stron z realnymi klientami: prawdopodobnie właściwy default.
- Skrypt `scripts/deploy-preflight.sh` = punkty 1–7 jako jeden runnable check.

---

## 5. PROD ROLLOUT — serwer MCP (kolumna `role` + klucze)

Migracja `20260729_062040_mcp_roles` dodaje kolumnę `users.role` (default `editor`)
i tabele kluczy MCP, a na końcu backfilluje **wszystkich istniejących userów na
`admin`** — bez tego właściciel wypadłby z panelu (`access.admin = isAdmin`).

1. **Deploy z `PAYLOAD_MIGRATE=true`** (runtime env w Coolify) — migracje lecą przy
   starcie kontenera. Po deployu sprawdź w panelu, że logowanie admina działa.
2. **Bot ręcznie w panelu prod**: Users → Create → rola **editor**, email
   `mcp-agent@stal.qaci.pl`, hasło losowe (i tak nieużywane).
   ⚠️ **NIE odpalaj seeda na prodzie** — kasuje całą treść.
3. **Klucz**: MCP → API Keys → Create → `user` = bot z pkt 2 → odhacz uprawnienia
   (kolekcje/globale startują z FALSE!) → zapisz i skopiuj klucz (widoczny raz).
4. **Podpięcie klienta**:
   ```bash
   claude mcp add --transport http stalmet https://stal.qaci.pl/api/mcp \
     --header "Authorization: Bearer <klucz>"
   ```
5. **Weryfikacja**: `MCP_KEY=<klucz> ./scripts/mcp-smoke.sh https://stal.qaci.pl`
   → `OK: MCP smoke passed`.

Rollback klucza: skasuj rekord w MCP → API Keys (natychmiast 401).
