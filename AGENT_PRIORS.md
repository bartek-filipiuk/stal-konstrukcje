# AGENT_PRIORS — wiedza „z głowy", która przyspieszyła budowę

> Co agent WIEDZIAŁ zanim dotknął tego projektu — i co trzeba przekazać innemu
> agentowi (niekoniecznie Claude), żeby budował równie szybko. To NIE są bugi
> odkryte w trakcie (te są w PAGE_DEVTIPS/DESIGNTIPS/DEPLOYTIPS) — to priors:
> model stacku, domena, defaulty decyzyjne. Na końcu: gotowy blok do wklejenia
> w system prompt innego agenta.

Transparentnie o źródłach w tej realizacji:

| Źródło | Co dało | Jak przenieść |
|---|---|---|
| Pliki repo (CLAUDE.md, PAGE_*, examples/ultra-mechanic, prompty/) | strukturę procesu i wzorzec szczegółowości | kopiują się same z boilerplate'em |
| **Wiedza wytrenowana modelu** | wszystko poniżej | ten plik |
| Skille procesowe (protokół dowodów, humanize, tour) | dyscyplinę pracy | sekcja 5 |
| Trwałe memory agenta | **nic — było puste** | n/d |

---

## 1. Mentalny model stacku (Payload CMS 3 + Next 15) — fakty, które oszczędzają godziny

Rzeczy, których NIE trzeba było sprawdzać, bo agent je „wiedział". Inny agent
powinien je dostać wprost:

- **Payload 3 żyje wewnątrz Next** (route group `(payload)` = admin + API, `(frontend)` = strona).
  Nie ma osobnego serwera CMS.
- **Treść = kolekcje + globale; strony = tablica bloków** (`layout`), każdy blok to para
  `config.ts` (schema) + `Component.tsx`. Nowy typ sekcji = nowy blok + rejestracja
  w `RenderBlocks` i w kolekcji Pages + `generate:types`.
- **Typy są GENEROWANE** (`payload-types.ts`) — po każdej zmianie schemy `pnpm generate:types`;
  seed piszemy przeciwko tym typom, nie „na czuja".
- **Local API** (`payload.create/find/updateGlobal`) to droga seedowania — bez HTTP;
  upload pliku = `payload.create({ collection: 'media', filePath })`.
- **Rich text = Lexical JSON** o sztywnym kształcie (`root.children[].direction/format` to
  uniony literałów, nie stringi) — do seedu robi się helper `createRichText(text)`.
- **Dev = push-mode** (schema wpychana do bazy automatycznie), prod = migracje.
  To dwa różne światy — mieszanie ich boli.
- **Draft/publish + wersje** są wbudowane (`_status: 'published'` w seedzie, zakładka
  Versions w adminie — argument sprzedażowy dla klienta: „da się cofnąć").
- **Admin UI jest po angielsku** domyślnie (localization w configu dotyczy TREŚCI,
  nie UI panelu) — instrukcje dla klienta piszemy z angielskimi nazwami przycisków.
- **Next App Router**: layout grupy obejmuje wszystkie strony (fetch globali w layoutcie =
  każda strona dotyka bazy); `next/font` z `subsets` per font; `output: 'standalone'`
  trace'uje tylko importy (pliki czytane przez `fs` musi dołożyć Dockerfile).
- **Theming przez zmienne HSL** w `:root`/`[data-theme='dark']` (format `H S% L%` bez
  `hsl()`) + klasy semantyczne w komponentach → cała tożsamość wizualna w jednym pliku CSS.

## 2. CSS/frontend — reguły rzemiosła użyte bez szukania

- Specyficzność: klasa vs klasa Tailwinda = remis, wygrywa kolejność ładowania;
  pewne nadpisanie = podbicie selektora (`.hero-section .hero-background`).
- `:root` i `[data-theme]` mają równą specyficzność — o wygranej decyduje kolejność
  w pliku; zmienne definiować wyłącznie w głównych blokach palety.
- Natywny `<dialog>.showModal()` daje wyśrodkowany modal + Esc + focus-trap + `::backdrop`
  za darmo — lightbox bez żadnej biblioteki.
- `prefers-reduced-motion` musi jawnie pokazać treść animowaną z `delay` + `both`.
- Kontrast liczy się Z GÓRY (na etapie specyfikacji): jasny tekst na `#F26419` nie
  przechodzi AA (3.2:1), ciemny przechodzi (5.6:1) — stąd ciemny tekst na przyciskach.
- Polskie wersaliki z diakrytykami (Ó Ś Ż Ź Ć Ń) sięgają NAD wysokość wersalika —
  nagłówki uppercase potrzebują `line-height ≥ 1.12`; każdy font przez `latin-ext`
  (i nie każdy Google Font go MA — np. Space Mono nie).

## 3. Domena: polska strona firmy usługowej (tu: konstrukcje stalowe)

Wiedza branżowa, dzięki której brief i treści powstały bez klienta:

- **Struktura strony firmy usługowej jest stała**: Główna / Oferta / Realizacje /
  O firmie / Kontakt + JEDNO CTA („Wyceń") — bo proces zakupowy zaczyna się od
  pomiaru i wyceny, nie od koszyka.
- **Galeria realizacji to główny konwerter** w branżach portfolio-driven
  (budowlanka, stal, meble) — bez zdjęć klienta strona jest kaleka, więc placeholdery
  muszą wyglądać celowo.
- **SEO lokalne = frazy „jak człowiek szuka”**: „brama przesuwna Poznań cena",
  nie „usługi metaloplastyczne premium"; miasto + okoliczne miejscowości.
- **Realne widełki cen** (research 2025/26): ogrodzenie panelowe z montażem
  200–450 zł/mb, brama przesuwna od ~3,5 tys. zł, balustrady 250–600 zł/mb —
  fikcyjna firma z takimi cenami brzmi wiarygodnie.
- **USP rzemiosła są przewidywalne** i trzeba je konkretyzować: „telefon odbiera
  właściciel", „ocynk + malowanie proszkowe w standardzie", „atesty/uprawnienia",
  „wycena przed pracami" — a pain pointy klientów to nieodbierane telefony,
  poślizgi terminów i rdza po zimie.
- **Ton**: rzeczowy, po polsku, bez korpomowy („Mierzymy, wyceniamy, robimy" >
  „kompleksowe rozwiązania premium").

## 4. Defaulty decyzyjne designu i obrazów

- Branża techniczna/industrialna → grafit + JEDEN akcent bezpieczeństwa (safety
  orange/żółć cynkowa); akcent tylko tam, gdzie się klika.
- Mono-font w rolach technicznych (liczby, etykiety, podpisy) tanio daje klimat
  „karty katalogowej"; kondensowany grotesk na nagłówki = szyld.
- Jeden WOW-efekt na stronę (CSS-only), reszta to spójność — signature detail
  powtórzony ≥3×.
- Prompty do generatorów obrazów pisze się **językiem fotografii** (obiektyw,
  światło, kadr), z kompozycją pod tekst (treść po lewej → obiekt po prawej,
  lewa strefa ciemna), bez twarzy na wprost (maska spawalnicza rozwiązuje problem
  „AI-twarzy"), z zakazami na końcu (no text/logos/watermarks); jedyne ciepłe
  światło w kadrze = kolor akcentu marki.
- Model do fotorealizmu na Replicate: flux-1.1-pro-ultra z `raw: true`
  (natywne 21:9/16:9, bez „AI-plastiku").

## 5. Przenośne praktyki procesu (działają u każdego agenta)

- Przeczytaj CAŁY kontekst projektu zanim napiszesz pierwszą linię; prześledź
  przepływ end-to-end zanim wybierzesz miejsce zmiany.
- **Zrzut ekranu > HTML 200** — bugi motywu/typografii widać tylko wizualnie.
- Każde „działa" z dowodem (komenda + output); każda zmiana zaatakowana
   scenariuszami zepsucia zanim pokażesz.
- Gust klienta (jasny/ciemny, akcent) to pytanie do człowieka, nie do zgadywania —
  ale zadaj JEDNO pytanie z rekomendacją, nie ankietę.
- Żywy PLAN/stan w pliku md — odhaczany po krokach, z sekcją decyzji — pozwala
  dowolnemu agentowi podjąć pracę w połowie.
- Selektory do automatyzacji UI wyłącznie accessible (role+name/label), zweryfikowane
  snapshotem a11y na żywej appce przed napisaniem scenariusza.

---

## 6. PRIME-BLOK — wklej innemu agentowi na start (skrót sekcji 1–5)

```
Budujesz polską stronę firmy usługowej na Payload CMS 3 + Next 15 (boilerplate).
Model stacku: CMS żyje w Next; treść = kolekcje/globale, strony = tablica bloków
(config.ts + Component.tsx, rejestracja w RenderBlocks i Pages, potem generate:types);
seed przez Local API (payload.create, upload = filePath); rich text = Lexical JSON
(helper createRichText); dev=push-mode, prod=migracje; typy są generowane — pisz
przeciwko payload-types. Theming: zmienne HSL w :root/[data-theme='dark'] + klasy
semantyczne; zmienne tylko w głównych blokach palety; nadpisywanie utilities przez
podbicie selektora. Polski: fonty z latin-ext (sprawdź, czy font go MA), uppercase
z diakrytykami wymaga line-height ≥1.12, kontrast licz przed implementacją (AA).
Strona firmy usługowej: 5 podstron (Główna/Oferta/Realizacje/O firmie/Kontakt),
JEDNO CTA „Wyceń", galeria realizacji to główny konwerter, SEO = frazy „jak człowiek
szuka" (usługa+miasto), USP konkretne (właściciel odbiera telefon, antykorozja
w standardzie, atesty), ton rzeczowy bez korpomowy. Design: grafit + jeden akcent
(safety orange), mono do liczb/etykiet, jeden WOW-efekt CSS-only. Obrazy AI: język
fotografii, kompozycja pod tekst, bez twarzy, zakazy na końcu prompta. Proces:
czytaj wszystko przed kodem, zrzut ekranu > HTTP 200, każde „działa" z dowodem,
o gust klienta pytaj (1 pytanie + rekomendacja), prowadź żywy PLAN.md z decyzjami.
```
