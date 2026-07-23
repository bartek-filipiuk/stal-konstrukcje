# HANDOFF DO KURSU — wnioski z iteracji „stal-konstrukcje" (2026-07)

> **Dla agenta budującego/aktualizującego kurs i boilerplate.**
> To podsumowanie drugiej pełnej iteracji (po ultra-mechanic): budowa demo-strony
> firmy konstrukcji stalowych od speca z FB do działającej strony z obrazami AI.
> Zadanie: wpiąć poniższe zmiany do (A) boilerplate'u i (B) kursu tak, żeby
> następna iteracja z INNYM biznesem była szybsza i lepsza. Na końcu: checklista wdrożenia.

---

## 1. NAJWAŻNIEJSZA ZMIANA WORKFLOW: INIT_PROMPT + żywy PLAN.md

Dotychczas kurs uczył sekwencji „ręcznej": research-briefu → researcher-designu → SETUP_PROMPT.
Ta iteracja domknęła to w **jeden samowystarczalny prompt wejściowy**:

- **`INIT_PROMPT.md`** — agent dostaje TYLKO `SPEC.md` i prowadzi całość od A do Z:
  5 faz (init → brief → design → implementacja → weryfikacja → raport), z twardą
  kolejnością czytania plików, przypisaniem devtipsów (litery A–N) do konkretnych
  kroków implementacji i Definition of Done.
- **`PLAN.md` (szablon w INIT_PROMPT)** — żywy stan projektu: tworzony w FAZIE 0,
  odhaczany po każdym kroku, z sekcją „Decyzje i odstępstwa" (realny port! nazwa!
  hexy palety!) i regułą wznowienia: „kontynuuj od pierwszego [ ]".
  To rozwiązuje problem utraty kontekstu między sesjami/agentami.

**Do kursu:** nowa lekcja (lub przebudowa lekcji o workflow): „Jeden prompt, jeden plan —
jak agent buduje stronę od speca do raportu". INIT_PROMPT to teraz KANONICZNY punkt wejścia;
prompty z `prompty/` (research-briefu, researcher-designu) zostają jako wywoływane przez niego moduły.

**Do boilerplate'u:** skopiować `INIT_PROMPT.md` 1:1 (jest projekto-agnostyczny).

---

## 2. NOWE PLIKI-DOKUMENTY (co → po co → dokąd)

| Plik | Co zawiera | Boilerplate? | Kurs? |
|---|---|---|---|
| `INIT_PROMPT.md` | Prompt A–Z + szablon PLAN.md | ✅ kopiuj 1:1 | ✅ lekcja o workflow |
| `PAGE_DEVTIPS.md` → sekcja **„Field Notes A–N"** | 14 przeszkód z tej iteracji z fixami (dark-first ×3 pliki, zmienne CSS w blokach palety, utilities vs theme.css, przepis na typowanie seedu, SITE_NAME ×4, latin-ext, reduced-motion+delay, drift portu, znane błędy tsc, EN-stringi, pętla weryfikacji, zombie next-server + smoke.sh) | ✅ dopisać do istniejącego PAGE_DEVTIPS | ✅ materiał „pułapki boilerplate'u" |
| `DESIGNTIPS.md` | Mechaniczna checklista QA designu — 8 kategorii z metodą sprawdzenia + rytuał 10 min | ✅ kopiuj 1:1 | ✅ lekcja „QA designu przed oddaniem" |
| `DESIGN_IMPROVEMENTS.md` | Ocena designu 7/10, co ograniczał boilerplate, **P0/P1/P2 upgrade'ów**, techniki „modern" (§4), checklist anty-nuda (§5) | ✅ sekcje §4-5 jako doc; P0-P2 = backlog kodu (patrz pkt 3) | ✅ lekcja „dlaczego strona wygląda tanio i jak to naprawić" |
| `REFERENCJE.md` | Wzorzec: strony referencyjne DLA KLIENTA (link + „co bierzemy" + „czego nie robimy") | ⚪ jako szablon/przykład | ✅ krótki moduł „jak pokazać klientowi kierunek przed budową" |
| `scripts/generate-images.mjs` | Zero-dep generator obrazów (Replicate, flux-1.1-pro-ultra, raw) | ✅ kopiuj 1:1 | ✅ lekcja o obrazach (pkt 5) |
| `AGENT_PRIORS.md` | Wiedza „z głowy" agenta (model stacku, domena, defaulty designu) + PRIME-blok do wklejenia dowolnemu agentowi | ✅ kopiuj 1:1 | ✅ moduł „jak przygotować agenta do pracy" |
| `HANDOFF_DO_KURSU.md` (ten plik) | — | ⚪ | wejście dla agenta kursu |

---

## 3. ZMIANY W KODZIE DO BACKPORTU DO BOILERPLATE'U

Wykonane tu, do przeniesienia do bazowego repo (wszystkie przetestowane na żywej stronie):

### P0 — bez tego następna strona znowu będzie kulawa
1. **Blok `Gallery`** (`src/blocks/Gallery/`) — grid portfolio z podpisami mono i CELOWYM
   placeholderem „ZDJĘCIE WKRÓTCE" gdy brak zdjęcia. Dla firm usługowych to główny konwerter.
2. **Rozszerzony `GlassHero`** — pola `eyebrow`, `accentWord`, `align` (left/center), `stats[]`;
   usunięty hardkod `text-center`/`bg-background`; `pictureClassName="absolute inset-0"` na Media
   (fix warningu next/image fill).
3. **Blok `ProcessSteps`** (`src/blocks/ProcessSteps/`) — numerowane kroki 01–04 (mono).
4. **`Features`**: +8 ikon branżowych lucide (fence, hammer, warehouse, shield, ruler, cog,
   flame, truck) + **fix buga linków** (komponent czytał `feature.link`, schema ma `linkUrl`/`linkLabel`).
5. **Rejestracje**: `RenderBlocks.tsx` + `collections/Pages` (gallery, processSteps).

### P1 — jakość i szybkość
6. **`StickyCTA`** (`src/components/StickyCTA/`) — mobilny pasek Zadzwoń|Wyceń, wpięty w layout;
   style + padding stopki w theme.css (nie zasłania copyright).
7. **`Logo.tsx`** — tekstowe (nie SVG z viewBox!), split pierwsze-słowo/sufiks, bez ucinania
   długich nazw; **w Header usunąć `dark:invert`** (robił z logo inne kolory niż w stopce).
8. **`generateMeta.ts` + `mergeOpenGraph.ts`** — SITE_NAME z env (koniec z „Payload Website Template").
9. **`tailwind.config.mjs`** — fontFamily wskazuje realne zmienne (`--font-sans/-heading/-mono`),
   nie martwe `--font-geist-*`.
10. **Seed — wzorce** do przeniesienia jako komentarze/helpery w bazowym seedzie:
    `createPage` (Omit hero + wstrzyknięcie `{type:'none'}`), typ `LayoutBlock`,
    `uploadImage(file, alt)` z odpornością na brak pliku, nav `value: number`.

### P2 — do rozważenia (nie zrobione tutaj)
11. **Dark-first w JEDNYM pliku** — dziś wymaga zmian w 3 miejscach (Field Note A).
    Refaktor: jedno źródło `defaultTheme` + flaga `followOsPreference`. To usunie
    najczęstszą pułapkę w ogóle.
12. Bloki FAQ / LogoCloud / SplitContent (DESIGN_IMPROVEMENTS §3 P2).
13. i18n stringów UI stopki/theme-selectora zamiast hardkodu PL.

---

## 4. NOWY KROK W PIPELINE: OBRAZY AI (nie było go w kursie)

- **Skrypt**: `scripts/generate-images.mjs` — zero zależności (Node fetch), model
  `black-forest-labs/flux-1.1-pro-ultra` z `raw: true` (fotorealizm bez „AI-plastiku"),
  natywne 21:9/16:9 (bez crop-hacka z 3:2). Idempotentny (`--force` do nadpisania),
  odporny na rate-limit (retry = ponowne uruchomienie).
- **Token GLOBALNIE**: `~/.claude/settings.json` → blok `env.REPLICATE_API_TOKEN` —
  działa w każdym projekcie. Skrypt szuka: env procesu → `.env` projektu → globalne settings.
- **Zasady promptów** (są w komentarzu skryptu — do kursu jako reguły):
  język FOTOGRAFII (obiektyw, światło, kadr), kompozycja pod tekst (treść po lewej →
  obiekt po prawej, lewa strefa ciemna), twarze zakryte/nieobecne (zero uncanny),
  jedyne ciepłe światło = kolor akcentu marki, na końcu zakazy (no text/logos/watermarks).
- **Zakres**: generujemy TYLKO obrazy krytyczne (hero + ew. detal pod hero podstron).
  **Galeria NIGDY z AI** — czeka na zdjęcia klienta, używa placeholderów.
- **Wpięcie**: seed wgrywa pliki do kolekcji `media` i ustawia `backgroundMedia` heroesów;
  brak plików = hero na tle CSS (nic się nie wywala).

**Do kursu:** nowa lekcja „Obrazy: kiedy AI, kiedy klient, jak promptować" + konfiguracja tokenu.

---

## 5. DWA REALNE BUGI DESIGNU → STAŁE CHECKI (⚠️ w DESIGNTIPS)

Warte osobnego omówienia w kursie, bo są uniwersalne i niewidoczne w HTML:

1. **Line-height × polskie diakrytyki**: `line-height: 1.02` na hero → akcent „Ó"
   z drugiego wiersza nachodził na litery pierwszego. Reguła: **nagłówki wersalikami ≥ 1.12**;
   test „ZAŻÓŁĆ GĘŚLĄ JAŹŃ" w każdym foncie; weryfikacja tylko zrzutem ekranu.
2. **Spójność logo header↔stopka**: header miał relikt `dark:invert` na Logo —
   w dark mode pomarańczowy znaczek robił się NIEBIESKI, napis ciemny. Reguła:
   jeden komponent, zero transformów na instancjach, porównanie `getComputedStyle` obu.

---

## 6. JAK TO SIĘ SPINA (mapa docelowa boilerplate'u)

```
SPEC.md  ──►  INIT_PROMPT.md  ──►  PLAN.md (żywy stan, wznowienia)
                   │
    ┌──────────────┼───────────────────────────┐
    ▼              ▼                           ▼
prompty/       prompty/                  FAZA 3-4 (implementacja+QA)
research-      researcher-               • PAGE_DEVTIPS (Field Notes A–N → kroki)
briefu.md      designu.md                • DESIGN_IMPROVEMENTS §4 (techniki modern)
    │              │                     • DESIGNTIPS (checklista QA przed oddaniem)
    ▼              ▼                     • scripts/generate-images.mjs (obrazy krytyczne)
PAGE_          PAGE_                     • bloki: GlassHero+ / Gallery / ProcessSteps /
DESCRIPTION    DESIGN                      Features(lucide) / StickyCTA
```

Podział ról dokumentów (żeby kurs nie mieszał):
- **PAGE_DEVTIPS** = pułapki TECHNICZNE boilerplate'u (jak coś działa/nie działa)
- **DESIGN_IMPROVEMENTS** = jak PROJEKTOWAĆ, żeby nie było nudno (przed/w trakcie)
- **DESIGNTIPS** = jak SPRAWDZIĆ design przed oddaniem (po implementacji)
- **INIT_PROMPT** = dyrygent, który wie, kiedy sięgnąć po który

---

## 7. CHECKLISTA WDROŻENIA (dla agenta kursu/boilerplate'u — po kolei)

### Boilerplate (repo bazowe)
- [ ] Backport kodu P0 (pkt 3.1–3.5): Gallery, GlassHero+, ProcessSteps, Features, rejestracje
- [ ] Backport P1 (3.6–3.10): StickyCTA, Logo, meta-utils, tailwind fonts, wzorce seedu
- [ ] Skopiuj: `INIT_PROMPT.md`, `DESIGNTIPS.md`, `DEPLOYTIPS.md`, `scripts/generate-images.mjs`, `scripts/smoke.sh`
      (smoke: strony 2× + grep logu — łapie zombie-dev/stale-webpack, Field Note N)
- [ ] Backport fixów deployowych z DEPLOYTIPS §1 (packageManager, PAYLOAD_MIGRATE, force-dynamic
      bez generateStaticParams, Dockerfile ARG/seed-images/chown, SEED_SECRET, sitemap config,
      sekwencyjny delete w seedzie) — wtedy checklista deployu skraca się do punktów 8–14
- [ ] Dopisz „Field Notes A–N" do `PAGE_DEVTIPS.md`; `DESIGN_IMPROVEMENTS.md` §4–5 jako doc
- [ ] `pnpm generate:types` + smoke: seed → 5 stron 200 → screenshot obu motywów
- [ ] Rozważ P2.11 (dark-first w jednym pliku) — jeśli zrobisz, USUŃ Field Note A i krok [A] z INIT_PROMPT (nie ucz obejścia, które przestało istnieć)

### Kurs
- [ ] Przebuduj lekcję workflow wokół INIT_PROMPT + PLAN.md (pkt 1); prompty/ jako moduły
- [ ] Dodaj lekcję „Obrazy AI w pipeline" (pkt 4: model, prompty, token globalnie, zakres)
- [ ] Dodaj lekcję/sekcję „QA designu" na bazie DESIGNTIPS + dwa bugi z pkt 5 jako case study
- [ ] Zaktualizuj lekcję o blokach: nowe możliwości hero (eyebrow/stats/accent/align), Gallery, ProcessSteps, StickyCTA, ikony branżowe
- [ ] Wpleć „Field Notes" tam, gdzie kurs omawia dany temat (nie jako osobny wykład — jako ostrzeżenia przy krokach)
- [ ] Case study iteracji: spec z FB → STALMET (screeny przed/po redesignie są w sesji; PLAN.md-flow jako przykład)

### Sanity-check spójności po wdrożeniu
- [ ] INIT_PROMPT ↔ nazwy plików w repo (kolejność czytania wskazuje istniejące pliki)
- [ ] PAGE_DEVTIPS litery A–N ↔ odwołania [A]…[N] w INIT_PROMPT FAZA 3–4 (numeracja musi się zgadzać!)
- [ ] DESIGNTIPS ↔ FAZA 4 pkt 8; szablon PLAN.md ↔ Definition of Done
