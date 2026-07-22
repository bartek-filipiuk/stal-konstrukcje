# INIT_PROMPT — nowa strona od A do Z (boilerplate Payload + Next)

> **Jak użyć:** w świeżym klonie boilerplate'u wklej spec zlecenia do `SPEC.md`,
> a potem powiedz agentowi: *„Przeczytaj INIT_PROMPT.md i wykonaj go od A do Z"*.
> Minimalny wsad: `SPEC.md` (branża + miasto wystarczą). Wszystko poniżej jest DLA AGENTA.

---

## ROLA I CEL

Jesteś wykonawcą kompletnej strony firmowej na tym boilerplacie: research → brief →
design → implementacja → weryfikacja → raport. Pracujesz etapami, po kolei, z dowodami.
Nie pytasz o rzeczy, które są w plikach projektu; pytasz TYLKO tam, gdzie ten prompt
wprost każe (gust klienta, brakujące fakty o firmie, sekrety).

**Zasada nadrzędna: `PLAN.md` jest żywym stanem projektu.**
- Na starcie (FAZA 0) tworzysz `PLAN.md` z szablonu na końcu tego pliku.
- Po KAŻDYM ukończonym kroku: odhaczasz checkbox i dopisujesz jednolinijkową notatkę
  (decyzja / odstępstwo / wartość — np. realny port dev, nazwa firmy, hexy palety).
- Jeśli `PLAN.md` już istnieje → to jest wznowienie: przeczytaj go i kontynuuj od
  pierwszego nieodhaczonego kroku. Niczego nie rób od nowa.
- Sekcja `## Decyzje i odstępstwa` w PLAN.md to jedyne źródło prawdy o tym,
  co ustalono w trakcie — zapisuj tam wszystko, co przyszły agent musiałby wiedzieć.

---

## KOLEJNOŚĆ CZYTANIA (zanim napiszesz cokolwiek)

1. `CLAUDE.md` — struktura projektu i komendy
2. `PAGE_DEVTIPS.md` — **CAŁY, ze szczególnym naciskiem na „Field Notes" (punkty A–N)**;
   to są przeszkody z poprzednich realizacji — każda zignorowana kosztuje godzinę debugowania
3. `DESIGN_IMPROVEMENTS.md` — sekcja 4 (techniki „modern") i sekcja 5 (checklist anty-nuda)
3a. `DESIGNTIPS.md` — mechaniczne checki QA designu (typografia×polskie znaki, spójność brandu, stany, mobile)
4. `SPEC.md` — zlecenie klienta
5. `examples/ultra-mechanic/` — wzór poziomu szczegółowości briefu i designu
6. `prompty/research-briefu.md` i `prompty/researcher-designu.md` — prompty robocze FAZ 1–2

---

## FAZA 0 — INIT

1. Przeczytaj pliki z listy powyżej.
2. Utwórz `PLAN.md` z szablonu (koniec tego pliku), wypełnij nagłówek (data, spec w skrócie).
3. Sprawdź środowisko: `docker compose up -d` → `pg_isready`; `pnpm install` jeśli trzeba;
   zanotuj w PLAN.md port DB z `.env` (każdy projekt ma INNY port, nie zakładaj 5432/5433).

## FAZA 1 — BRIEF → `PAGE_DESCRIPTION.md`

Wykonaj **PROMPT z `prompty/research-briefu.md`** (kroki 0–3 tego promptu, po kolei):
tryb RESEARCH (masz internet), pytania domykające do użytkownika (max 5) ALBO tryb
„firma fikcyjna wg speca" — wtedy dane wymyślasz realistycznie i oznaczasz
`> Firma demonstracyjna — dane fikcyjne.` Wynik: nadpisany `PAGE_DESCRIPTION.md` +
lista `[DO POTWIERDZENIA]`. Odhacz w PLAN.md, zapisz nazwę firmy i miasto w Decyzjach.

## FAZA 2 — DESIGN → `PAGE_DESIGN.md`

Wykonaj **PROMPT z `prompty/researcher-designu.md`**. Obowiązkowo:
- **Zapytaj użytkownika (AskUserQuestion, max 2 pytania): motyw jasny/ciemny/hybryda
  oraz kolor akcentu** — to gust klienta, nie zgaduj. Logo istnieje → paleta OD logo.
- Kontrasty WCAG policz w PAGE_DESIGN (pary tekst/tło z ratio) — nie odkładaj do CSS.
- Shot-lista zdjęć per podstrona + gotowe prompty EN dla 2–3 krytycznych.
- Jeden WOW factor (CSS-only). Sprawdź checklist z `DESIGN_IMPROVEMENTS.md` §5.
Wynik: nadpisany `PAGE_DESIGN.md`. Odhacz, zapisz hexy palety w Decyzjach.

## FAZA 3 — IMPLEMENTACJA

Kolejność kroków + litery Field Notes z PAGE_DEVTIPS, które MUSISZ wtedy zastosować:

1. **Fonty** — `layout.tsx` (next/font, `subsets: ['latin','latin-ext']`, sprawdź czy
   font MA latin-ext) + `tailwind.config.mjs` fontFamily (te same zmienne!) +
   `globals.css` body. **[G, H]**
2. **Motyw ciemny (jeśli wybrany)** — dark-first wymaga zmian w **3 plikach**
   (`ThemeSelector/types.ts`, `shared.ts`, `InitTheme` + `providers/Theme/index.tsx`
   bez fallbacku na preferencję OS). **[A]**
3. **Nazwa strony** — `.env` `NEXT_PUBLIC_SITE_NAME` + `src/plugins/index.ts` +
   `src/utilities/generateMeta.ts` + `src/utilities/mergeOpenGraph.ts`
   (grep-check: `grep -rn "Payload Website Template" src/` → 0 wyników). Logo: długa
   nazwa → sprawdź `components/Logo`. **[F, L]**
4. **`theme.css`** — cała tożsamość wizualna wg PAGE_DESIGN: zmienne TYLKO w dwóch
   głównych blokach palety **[B]**; nadpisywanie utilities przez wyższą specyficzność
   **[C]**; jawny fallback `prefers-reduced-motion` dla animacji z delay **[I]**;
   techniki modern z `DESIGN_IMPROVEMENTS.md` §4 (noise, skala typo, numerowane
   sekcje, jeden WOW).
5. **Bloki** — używaj istniejących: GlassHero (eyebrow/accentWord/align/stats),
   Features (ikony branżowe lucide), Gallery (placeholdery gdy brak zdjęć),
   ProcessSteps, Testimonials, ContactCTA. Nowy blok tylko, gdy PAGE_DESIGN
   opisuje coś, czego nie ma (Golden Rule: implementuj, nie upraszczaj designu).
   Po każdej zmianie configów: `pnpm generate:types`.
6. **Seed** — `src/endpoints/seed/index.ts` wg przepisu **[E]** (helper `createPage`
   z `hero:{type:'none'}`, `LayoutBlock`, nav `value: number`). Strony DOKŁADNIE wg
   briefu (typowo 5), nawigacja header+footer, site-settings (nazwa, kontakt, social).
   Treści po polsku, konkretne, z briefu — zero lorem ipsum.
7. **Obrazy** — jeśli w `.env` jest `REPLICATE_API_TOKEN`: wygeneruj obrazy
   KRYTYCZNE z shot-listy przez `scripts/generate-images.mjs` (hero; NIE galeria —
   galeria czeka na zdjęcia klienta, używa placeholderów). Bez tokenu: pomiń,
   dopisz do `[DO POTWIERDZENIA]`. Tekst na zdjęciu = overlay min. 60%.

## FAZA 4 — WERYFIKACJA (dowody, nie deklaracje)

1. **Czysty restart wg [N]**: zabij WSZYSTKIE procesy next tego projektu po cwd
   (`ss -tlnp` + kill po `/proc/PID/cwd` — `lsof -ti | xargs kill` zostawia zombie
   `next-server`!), `rm -rf .next`, start z pinowanym portem; **odczytaj REALNY port
   z logu** **[J, N]** — zapisz go w PLAN.md.
2. Seed: `curl http://localhost:PORT/next/seed` → `{"success":true}`.
3. **`scripts/smoke.sh PORT [ścieżka-logu-dev]`** — każda podstrona 2× (drugi przebieg
   łapie stale-webpack) + grep logu. Musi skończyć `SMOKE OK`. **[N]**
4. `npx tsc --noEmit` — filtruj znane błędy boilerplate'u **[K]**; w TWOICH plikach: 0.
5. `pnpm lint` — zero errorów w twoich plikach.
6. **Screenshot pełnej strony (desktop)** — bug motywu light/dark widać TYLKO na
   zrzucie, nie w HTML. Sprawdź OBA motywy (przełącznik w stopce).
7. Mobile 390px: brak poziomego scrolla, H1 ≥ 32px, sticky CTA widoczne, stopka
   nie zasłonięta (asercje skryptem w przeglądarce, jeśli screenshot emulacji padnie).
8. Checklist designu: **`DESIGNTIPS.md` (cała, punkt po punkcie — w tym line-height
   vs polskie diakrytyki i identyczność logo header↔stopka)** + `DESIGN_IMPROVEMENTS.md` §5
   + `SETUP_PROMPT.md` Step 5 (kolory, efekty, animacje, typografia, WCAG).
9. Wszystko odhacz w PLAN.md.

## FAZA 5 — RAPORT KOŃCOWY

W ostatniej odpowiedzi podaj: co powstało (strony + bloki), decyzje designu (1 akapit),
listę `[DO POTWIERDZENIA]` dla klienta, jak uruchomić (porty, admin login), zrzut ekranu.
`PLAN.md` zostaje w repo jako dokumentacja przebiegu.

---

## DEFINITION OF DONE

- [ ] `PAGE_DESCRIPTION.md` + `PAGE_DESIGN.md` kompletne (struktura szablonów 1:1)
- [ ] `theme.css` bez placeholderów; obie palety (light+dark); WCAG AA potwierdzone
- [ ] Wszystkie podstrony z briefu: seed + nav + 200
- [ ] Tytuł SEO = nazwa firmy (nie „Payload Website Template")
- [ ] tsc/lint: 0 nowych błędów względem bazy boilerplate'u
- [ ] Screenshot desktop (oba motywy) + weryfikacja mobile
- [ ] `PLAN.md` w pełni odhaczony, z decyzjami i realnym portem
- [ ] Raport końcowy z listą `[DO POTWIERDZENIA]`

---

## SZABLON `PLAN.md` (utwórz w FAZIE 0, aktualizuj po każdym kroku)

```markdown
# PLAN — <nazwa projektu> (init: <YYYY-MM-DD>)

> Żywy stan realizacji. Wznawiając pracę: kontynuuj od pierwszego [ ].
> Spec w skrócie: <1-2 zdania z SPEC.md>

## FAZA 0 — Init
- [ ] Przeczytane: CLAUDE.md, PAGE_DEVTIPS.md (A–N), DESIGNTIPS.md, DESIGN_IMPROVEMENTS.md, SPEC.md, examples, prompty
- [ ] Docker up + pg_isready (port DB: ____)
- [ ] pnpm install OK

## FAZA 1 — Brief
- [ ] PAGE_DESCRIPTION.md nadpisany (tryb: research / fikcja)
- [ ] Lista [DO POTWIERDZENIA] spisana

## FAZA 2 — Design
- [ ] Pytania o gust zadane (motyw: ____, akcent: ____)
- [ ] PAGE_DESIGN.md nadpisany (WCAG policzony, shot-lista, 1 WOW)

## FAZA 3 — Implementacja
- [ ] Fonty (layout + tailwind + globals) [G,H]
- [ ] Dark-first 3 pliki (jeśli ciemny) [A]
- [ ] SITE_NAME ×4 + logo [F,L]
- [ ] theme.css kompletny [B,C,I]
- [ ] Bloki/rozszerzenia wg PAGE_DESIGN + generate:types
- [ ] Seed: strony + nav + site-settings [E]
- [ ] Obrazy hero (token: jest/brak) — galeria = placeholdery

## FAZA 4 — Weryfikacja
- [ ] Czysty restart dev: kill-by-cwd + rm -rf .next (REALNY port: ____) [J,N]
- [ ] Seed {"success":true}
- [ ] scripts/smoke.sh → SMOKE OK (strony 2×200, log bez webpack-błędów) [N]
- [ ] tsc 0 nowych [K] · lint czysty
- [ ] Screenshot desktop — motyw dark ✓ light ✓
- [ ] Mobile 390px: overflow ✗, H1 ≥32px, sticky CTA ✓
- [ ] Checklisty: DESIGNTIPS ✓, DESIGN_IMPROVEMENTS §5 ✓, SETUP_PROMPT Step 5 ✓

## FAZA 5 — Raport
- [ ] Raport końcowy + [DO POTWIERDZENIA]

## Decyzje i odstępstwa
- <data> — <decyzja / wartość / dlaczego>

## Do zrobienia po oddaniu (backlog)
- <np. formularz kontaktowy, zdjęcia klienta do galerii>
```
