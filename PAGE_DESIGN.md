# Specyfikacja Wizualna — STALMET Konstrukcje Stalowe

> **KONCEPCJA: "WARSZTATOWA SOLIDNOŚĆ / SPEC-SHEET"**
> Idea przewodnia: **grafit surowej stali + pomarańcz ostrzegawczy jak oznaczenia BHP na hali — strona ma wyglądać jak karta katalogowa konstrukcji: rzeczowa, techniczna, bez ozdób.** Każda decyzja niżej wynika z tego jednego zdania: ciemny metal jako baza, ostry pomarańcz tylko tam, gdzie klient ma kliknąć, typografia jak z szyldu i z rysunku technicznego.
>
> **Firma demonstracyjna — dane fikcyjne** (marka, logo, adres — wg `SPEC.md`). Logo nie istnieje, więc paleta budowana od zera pod styl techniczny/industrialny wybrany przez klienta (motyw ciemny + akcent safety orange).

---

## DESIGN CONCEPT

### Motyw ogólny
| Cecha | Opis |
|-------|------|
| **Nazwa koncepcji** | Warsztatowa Solidność / Spec-Sheet |
| **Nastrój** | Ciężki, rzeczowy, męski, godny zaufania — „to się nie ugnie" |
| **Klimat branży** | Industrialny / techniczny: hala, spawy, ocynk, rysunek konstrukcyjny |

### Referencje (TRYB: RESEARCH — realne linki)
| Strona | Co z niej bierzemy |
|--------|--------------------|
| [stal-bram.pl](https://stal-bram.pl/) | Czysta prezentacja produktu (brama/ogrodzenie na wprost), nacisk na jakość wykonania i trwałość materiału — bez ozdobników. |
| [robstal-sroda.pl](https://robstal-sroda.pl/) | Podział oferty na jasne kategorie (spawanie / konstrukcje / bramy / zadaszenia) — dokładnie 4-5 filarów jak w naszym briefie. |
| [stahlzaun.pl](https://www.stahlzaun.pl/) (Poznań) | Lokalny konkurent — galeria realizacji jako główny dowód; potwierdza, że sekcja „Realizacje" musi być mocna i wizualna. |
| [American Alloy Fabricators](https://blog.thomasnet.com/best-industrial-website-design-examples) | Wzór z rynku US: certyfikat + jedno wyraźne CTA „Start Your Project" widoczne od razu — przenosimy na „Wyceń realizację". |

**Co branża nadużywa, a my to świadomie POMIJAMY:** kute ornamenty / „kowalstwo artystyczne" zawijasy, clipartowe ikony i renderowane katalogowe zdjęcia paneli. U nas: surowa stal, realne zdjęcia realizacji, zero zdobień.

### Inspiracja
```
INSPIRACJA:
- Surowa blacha stalowa i profile zamknięte przed malowaniem proszkowym
- Oznaczenia BHP na hali: czarno-żółte/pomarańczowe pasy, piktogramy
- Rysunek konstrukcyjny / blueprint: siatka, wymiary, kreski wymiarowe
- Iskra spawalnicza (pomarańcz) na ciemnym tle hali
```

---

## COLOR PALETTE

> Motyw **ciemny (dark-first)**. Jeden akcent CTA: safety orange. Wszystkie pary tekst/tło wyliczone poniżej (WCAG).

### Primary — kolor dominujący
```
KONCEPCJA: Grafit surowej stali
HEX: #14161A (tło główne) / rodzina: #0F1114 (głębsze), #1E2127 (karty)
SKOJARZENIA:
- Stal przed malowaniem, cień w hali, ciężar konstrukcji
- Solidność, powaga, „nośność"
UŻYCIE: tła sekcji, nawigacja, stopka, bazy kart
INTENSYWNOŚĆ: Głęboki, matowy — nie czysta czerń (ma „temperaturę" stali)
```

### Secondary — kolor wspierający
```
KONCEPCJA: Stal szczotkowana / chłodny szary
HEX: #6B7280 (metal), #9AA3AD (tekst drugorzędny), #2E333B (linie/ramki), #3A4048 (ramka hover)
SKOJARZENIA: ocynk, szlif, krawędź profilu, linia wymiarowa na rysunku
UŻYCIE: obramowania kart (1px), separatory, teksty pomocnicze, ikony w stanie spoczynku
INTENSYWNOŚĆ: Chłodny, neutralny, metaliczny
```

### Accent — kolor akcentu (JEDEN, CTA)
```
KONCEPCJA: Pomarańcz ostrzegawczy (safety orange) — iskra / oznaczenie BHP
HEX: #F26419  (hover ciemniejszy: #D8500C, świecenie: rgba(242,100,25,.35))
UŻYCIE:
- Przyciski CTA „Wyceń realizację" / „Zadzwoń"
- Linia pod nagłówkami H2 (krótka „kreska cięcia")
- Aktywna ramka pola formularza, hover linków, akcent na lewej krawędzi karty
- Ikony w stanie aktywnym/hover
ZASADA: pomarańcz = „tu klikasz". Nigdy jako duże tło ani do długich tekstów.
INTENSYWNOŚĆ: Ostry, nasycony, jeden na ekran dominujący punkt
```

### Tła
```
DARK MODE (główny):
- Tło główne: #14161A (grafit)
- Tło kart: #1E2127 z ramką 1px #2E333B
- Sekcje naprzemienne: #0F1114 (ciemniejszy pas) vs #14161A
- Sekcja hero i sekcja CTA/kontakt: #0F1114 + zdjęcie hali z ciemnym overlay ≥ 60%

LIGHT MODE (fallback boilerplate, drugorzędny):
- Tło: #F4F5F7 (beton), karty #FFFFFF, ramka #E2E5EA, tekst #14161A
- Utrzymać ten sam akcent #F26419; strona projektowana pod dark, light tylko poprawny technicznie
```

### Semantyczne
```
SUKCES: #2E9E5B (zieleń — formularz wysłany)
WARNING: #F4B400 (żółty cynkowy — spójny z klimatem BHP)
ERROR:   #E23D3D (czerwień — błąd pola)
INFO:    #2E86DE (stalowy niebieski — podpowiedzi)
```

### WCAG — wyliczone pary kontrastu
```
Tekst body #F2F4F7 na tle #14161A ....... ~15.8:1  → AAA ✅
Tekst drugorzędny #9AA3AD na #14161A ..... ~7.4:1   → AA  ✅
Akcent #F26419 (tekst/link) na #14161A ... ~5.6:1   → AA  ✅ (normalny tekst)
CTA: tekst #14161A na pomarańczu #F26419 . ~5.6:1   → AA  ✅  ← przycisk = CIEMNY tekst na pomarańczu (jak znak BHP), NIE biały
Biały #FFFFFF na pomarańczu #F26419 ...... ~3.2:1   → tylko duży tekst — dlatego przyciski mają tekst ciemny
Akcent #F26419 na karcie #1E2127 ......... ~4.9:1   → AA  ✅
```

---

## TYPOGRAPHY

> Wszystkie fonty z Google Fonts.

### Fonty
```
NAGŁÓWKI: "Oswald"
- Dlaczego: kondensowany, szyldowy — wygląda jak napis malowany na konstrukcji / tablicy hali.
- Użycie: H1–H3, UPPERCASE na H1/H2, weight 600–700, letter-spacing 0.02em.

BODY: "Inter"
- Dlaczego: neutralny grotesk o najwyższej czytelności — kontrapunkt dla mocnego Oswalda, długie opisy usług czyta się bez wysiłku.
- Użycie: akapity, opisy kart, formularz. Weight 400 (body), 500 (wyróżnienia).

TECHNICZNE / LICZBY / ETYKIETY: "Space Mono"
- Dlaczego: monospace = rysunek techniczny / spec-sheet; nadaje „wymiarowy" charakter liczbom i mikro-etykietom (np. „15 LAT", „PROMIEŃ 60 KM", numery kategorii „01 / 02").
- Użycie: statystyki, nadkreślenia sekcji (eyebrow label), dane techniczne. Weight 400/700, uppercase.
```

### Skala (px) i hierarchia
```
H1 (hero):   desktop 64 / mobile 40  — Oswald 700, UPPERCASE, tracking 0.02em, line-height 1.05
H2 (sekcja): desktop 40 / mobile 28  — Oswald 600, UPPERCASE, krótka pomarańczowa kreska pod spodem
H3 (karta):  desktop 24 / mobile 20  — Oswald 600
Body:        desktop 17 / mobile 16  — Inter 400, line-height 1.6, kolor #F2F4F7
Small/tech:  14 — Space Mono 400, UPPERCASE, tracking 0.08em, kolor #9AA3AD
Liczby stat: 40–56 — Space Mono 700, kolor #F2F4F7 z pomarańczowym „+"/jednostką
```

---

## VISUAL EFFECTS

### Tło
```
WANT: Yes
TYPE: Pattern (subtelny)
DESCRIPTION: Delikatna siatka blueprintowa (linie co 40px, kolor #FFFFFF opacity 3-4%)
na tłach sekcji ciemnych — daje efekt rysunku technicznego. Statyczna. W hero dodatkowo
ciemny overlay ≥60% na zdjęciu hali, żeby tekst był czytelny.
```

### Efekty kart
```
WANT: Yes
TYPE: Border + akcent
DESCRIPTION: Karta = tło #1E2127, ramka 1px #2E333B, promień 4px (ostry, „stalowy", nie zaokrąglony miękko).
Lewa krawędź: pasek 3px w kolorze #2E333B, który przy hover zmienia się na #F26419 (safety orange).
Cienie subtelne (0 2px 8px rgba(0,0,0,.4)) — bez glow w stanie spoczynku.
```

### Hover
```
WANT: Yes
TYPE: Lift + akcent
DESCRIPTION: translateY(-4px), lewy pasek karty zapala się na pomarańczowo, ramka → #3A4048,
delikatny pomarańczowy glow tylko na przyciskach CTA (box-shadow 0 0 20px rgba(242,100,25,.35)).
Transition 0.2s ease. Ikona w karcie zmienia kolor #9AA3AD → #F26419.
```

### Animacje
```
WANT: Yes (oszczędnie)
TYPE: Fade-in + slide-up przy scrollu (IntersectionObserver, stagger 80ms)
INTENSITY: Subtelna. Translacja 16px, opacity 0→1, 0.4s. Liczniki statystyk „doliczają" do wartości.
Reduced-motion: wyłączone całkowicie.
```

### Elementy dekoracyjne
```
WANT: Yes
ELEMENTS: Linie / kreski wymiarowe / numery kategorii
DESCRIPTION:
- „Kreska cięcia": krótka pomarańczowa linia 48px pod H2.
- Eyebrow label: mono-tekst z numerem „01 —" nad tytułem sekcji.
- Separator sekcji: pojedyncza cienka linia #2E333B, miejscami z pomarańczowym 48px akcentem.
- Pas ostrzegawczy (czarno-pomarańczowe ukośne paski) TYLKO w jednym miejscu: nad stopką lub w banerze CTA. Używać raz — inaczej robi się krzykliwie.
CZEGO NIE ROBIMY: brak glassmorphism, brak gradientowych teł, brak kutych ornamentów, brak parallax/bibliotek JS, brak auto-play karuzeli, brak zaokrągleń > 6px.
```

---

## COMPONENT STYLING

### Hero
```
LAYOUT: Full-width, wysokość ~85vh. Treść wyrównana do LEWEJ (nie centrowana) — jak nagłówek karty technicznej.
BACKGROUND: Zdjęcie hali/konstrukcji nocą + overlay #0F1114 65% + siatka blueprint 3%.
HEADLINE: H1 UPPERCASE, jedno słowo w pomarańczu (np. „KONSTRUKCJE STALOWE, KTÓRE SIĘ NIE UGNĄ" — „NIE UGNĄ" pomarańczowe).
EYEBROW: mono „STALMET · SWARZĘDZ / POZNAŃ · OD 2011".
STATS: 3 liczby w Space Mono (15 LAT · PROMIEŃ 60 KM · 100% SPAWY Z UPRAWNIENIAMI).
CTA PRIMARY: „WYCEŃ REALIZACJĘ" — pełny pomarańcz #F26419, tekst ciemny #14161A, ikona strzałki.
CTA SECONDARY: „ZADZWOŃ: 600 700 800" — outline 1px #6B7280, tekst jasny, click-to-call.
```

### Karty usług (Features)
```
LAYOUT: Grid 2x2 lub 3x2 (5 kategorii oferty + 1 „inne/nietypowe"). Mobile 1 kolumna.
CARD STYLE: Bordered (opis wyżej), numer kategorii „01–06" w mono w rogu.
ICONS: lucide-react, line 2px, #9AA3AD → #F26419 na hover (bramy, balustrada, zadaszenie, konstrukcja/belka, spaw, młot/inne).
HOVER: lift + lewy pasek pomarańczowy (opis w Hover).
```

### Realizacje / galeria (KLUCZOWE — spec wymaga galerii)
```
LAYOUT: Masonry lub grid 3 kolumny, kafle zdjęć realizacji.
CARD STYLE: Zdjęcie + ciemny gradient od dołu + podpis (typ realizacji + lokalizacja) w mono na dole.
HOVER: lekki zoom zdjęcia (scale 1.04), pomarańczowa ramka 1px. Klik → lightbox (opcjonalnie).
```

### Opinie (Testimonials)
```
LAYOUT: Grid 3 (desktop) / 1 (mobile), bez auto-karuzeli.
CARD STYLE: Cudzysłów „ w pomarańczu (48px, opacity 20%), 5 gwiazdek pomarańczowych, autor + typ zlecenia w mono.
BACKGROUND: pas ciemniejszy #0F1114 dla oddzielenia od reszty.
```

### Kontakt / CTA
```
LAYOUT: 2 kolumny — Formularz | Dane + mapa.
BACKGROUND: #0F1114, nad sekcją jedyny pas ostrzegawczy (czarno-pomarańczowy).
EMPHASIS: równorzędnie formularz („Wyceń realizację") i telefon (click-to-call, pomarańczowy).
FORMULARZ: pola imię / telefon(req) / email / opis + załącznik (zdjęcie/rysunek). Aktywne pole = ramka #F26419. Przycisk pomarańczowy.
```

### Nawigacja
```
STYLE: Solid #14161A (nie glass), 1px dolna linia #2E333B. Sticky.
POSITION: Sticky top.
CTA BUTTON: „WYCEŃ" pomarańczowy po prawej + telefon widoczny na desktop, ikona telefonu na mobile.
MENU: Oferta · Realizacje · O firmie · Kontakt (4 linki = 5 podstron z Główną jako logo-home).
```

### Stopka
```
STYLE: Ciemna #0F1114, nad nią pas ostrzegawczy.
COLUMNS: 4 — Marka+tagline / Oferta (linki) / Kontakt (adres, tel, mail, godziny) / Obszar działania (Poznań +60 km).
SOCIAL ICONS: Facebook, Instagram — #9AA3AD → #F26419 na hover.
```

---

## PLACEHOLDER IMAGES — SHOT-LISTA

> Źródło priorytetowo: **realne zdjęcia realizacji klienta** (brief wymaga galerii — to materiał do zebrania). Do makiety/demo: AI lub stock. Fikcyjna firma = brak własnych zdjęć, więc na start AI/stock.

| Miejsce (podstrona → sekcja) | Co na zdjęciu (kadr, orientacja) | Skąd wziąć | Priorytet |
|---|---|---|---|
| Główna → hero | Hala nocą, konstrukcja stalowa / spawacz przy pracy, iskry, szeroki kadr poziomy, przyciemnione pod tekst | AI (prompt niżej) → docelowo własne | **KRYTYCZNE** |
| Główna → sekcja oferty (tło/akcent) | Zbliżenie na profile stalowe / krawędź spawu, poziome | stock: „steel welding close up dark" | opcjonalne |
| Główna → realizacje (teaser 3 kafle) | 3 realizacje: brama przesuwna, balustrada nierdzewna, zadaszenie — kadr produktowy w plenerze | własne klienta → AI (prompt niżej) | **KRYTYCZNE** |
| Oferta → nagłówki 5 kategorii | Po 1 zdjęciu na kategorię (ogrodzenie panelowe, brama, balustrada, zadaszenie/wiata, konstrukcja hali) | własne → stock: „[kategoria] steel powder coated" | ważne |
| Realizacje → galeria główna | 9–12 kafli różnych realizacji, spójne oświetlenie dzienne, plener/hala | **własne klienta (docelowo obowiązkowe)** | **KRYTYCZNE** |
| O firmie → hero/portret | Właściciel/spawacz przy konstrukcji w hali, naturalne światło robocze, pionowe lub 4:3 | AI (prompt niżej) → własne | ważne |
| O firmie → proces | Etapy: pomiar w terenie / spawanie / malowanie proszkowe / montaż — 3-4 kadry | stock: „metal fabrication process" | opcjonalne |
| Kontakt → tło/mapa | Brama/tabliczka firmy przy wjeździe do hali lub sama mapa | AI/stock/mapa Google | opcjonalne |

### Gotowe prompty do generatora (EN, spójne z ideą przewodnią)

**1. HERO (krytyczne):**
```
Wide cinematic shot inside a steel fabrication workshop at night, a welder in a
dark work jacket welding a large steel structure, bright orange sparks flying,
raw graphite-grey steel beams, industrial hall, dramatic low-key lighting, deep
shadows, single warm orange light source, realistic photo, 35mm, horizontal
16:9, dark moody atmosphere, high detail, space on the left for text overlay
```

**2. REALIZACJE — brama przesuwna (krytyczne):**
```
Modern horizontal-slat steel sliding gate in matte anthracite powder-coated
finish, mounted at a contemporary single-family house driveway, clean geometric
design, daylight, slightly overcast even light, sharp product-focused shot,
realistic architecture photography, no ornaments, no people, horizontal
```

**3. O FIRMIE — właściciel (ważne):**
```
Portrait of an experienced male steel fabricator standing in front of a welded
steel structure inside a workshop, wearing work clothes, confident calm
expression, natural industrial daylight from a side window, graphite steel tones
with subtle warm accents, realistic documentary photo, 4:3, shallow depth of field
```

---

## RESPONSIVE DESIGN

### Priorytety mobile
```
1. CTA „Wyceń" + telefon (click-to-call) — sticky przycisk na dole ekranu
2. Skrót oferty (5 kategorii, 1 kolumna)
3. Galeria realizacji (scroll pionowy, lazy-load)
```

### Zachowanie animacji
```
MOBILE: Reduce — tylko fade-in, bez slide, liczniki bez „doliczania"
TABLET: Keep (uproszczone)
DESKTOP: Keep all
```

---

## ACCESSIBILITY

```
CONTRAST: AA (pary wyliczone w COLOR PALETTE; body osiąga AAA)
FOCUS INDICATORS: pomarańczowy outline 2px #F26419 + offset 2px na wszystkich elementach interaktywnych
REDUCED MOTION: Honor system preference: Yes — @media (prefers-reduced-motion) wyłącza scroll-reveal, liczniki, zoom
IMAGES: alt na wszystkich; teksty nad zdjęciami zawsze na overlay ≥ 60%
PRZYCISKI: min 44px touch target; CTA ciemny tekst na pomarańczu (nie biały) dla kontrastu AA
```

---

## WOW FACTORS

> Zasada: JEDEN efekt, reszta to spójność. Wykonalny w czystym CSS, bez bibliotek.

1. **„LASER CUT LINE" w hero** — pozioma pomarańczowa linia (2px, #F26419, z glow) jednorazowo przejeżdża przez hero od lewej do prawej przy wejściu na stronę, jak głowica plazmy/lasera tnąca blachę, i zostawia za sobą pojawiający się nagłówek.
   > Czysty CSS: `@keyframes` na pseudo-elemencie `::after` (transform translateX + width), nagłówek odsłaniany przez `clip-path`/opacity zsynchronizowany animacją. Odpala się raz, ~1.2s, respektuje `prefers-reduced-motion` (wtedy statyczna linia). Zero JS, zero bibliotek.

---

## SUMMARY

| Aspekt | Opis |
|--------|------|
| **Ogólny odbiór** | Ciemna, techniczna strona jak karta katalogowa konstrukcji — surowa stal + jeden ostry pomarańcz na akcjach. Rzeczowo, ciężko, godne zaufania. |
| **Kluczowe kolory** | Primary grafit `#14161A` · Secondary stal `#6B7280`/`#2E333B` · Accent safety orange `#F26419` |
| **Typografia** | Oswald (szyldowe nagłówki) · Inter (czytelny body) · Space Mono (liczby/etykiety techniczne) |
| **Efekty** | Siatka blueprint 3%, ramki stalowe, pomarańczowa „kreska cięcia" pod H2, hover lift+akcent, 1× laser-cut hero |
| **Docelowa emocja** | „Ci ludzie robią solidnie i wiedzą, co robią — dzwonię po wycenę." |
```
