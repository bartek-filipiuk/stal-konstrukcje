# Uwagi do designu — wnioski z projektu stal-konstrukcje (2026-07)

> Cel: podnieść jakość KOLEJNYCH stron z tego boilerplate'u. Ocena obecnego efektu,
> co go ograniczyło, i konkretne zmiany do wniesienia do boilerplate'u.
> Werdykt krótko: **solidne 7/10 — spójne i czytelne, ale „bezpieczne".**
> Do poziomu „wow/modern" brakuje: zdjęć, galerii, asymetrii i 2–3 odważniejszych zabiegów.

---

## 1. Co wyszło dobrze (zostawić jako wzorzec)

- **Dyscyplina jednego akcentu** — pomarańcz tylko na akcjach; strona nie jest „choinką".
- **Pas ostrzegawczy użyty RAZ** (nad sekcją CTA) — zapada w pamięć, nie męczy.
- **Mono-font w rolach technicznych** (role autorów opinii, etykiety) — daje klimat spec-sheet tanim kosztem.
- **Kreska cięcia pod H2** — prosty, powtarzalny sygnaturowy detal.
- **Dark-first z wyliczonym kontrastem WCAG w PAGE_DESIGN** — zero zgadywania przy theme.css.
- Proces: paleta liczona z hexów → HSL w zmiennych; wszystkie decyzje w PAGE_DESIGN przed kodem.

---

## 2. Co ciągnie design w dół — i DLACZEGO (przyczyna w boilerplate)

### 2.1 Hero: pusty i wyśrodkowany (największa strata)
Efekt: duża ciemna plama, tekst na środku — wygląda jak „ładny placeholder", nie jak strona firmy.
Przyczyny:
- `GlassHero/Component.tsx` **hardkoduje `text-center`** — projektowany hero „wyrównany do lewej jak karta techniczna" był niewykonalny bez edycji komponentu.
- Blok nie ma pól: **eyebrow** (mono-etykieta nad tytułem), **stats row** (3 liczby: lata / promień / uprawnienia), **akcentowane słowo** w headline. Wszystko to było w PAGE_DESIGN i przepadło.
- Brak zdjęcia: `backgroundMedia` istnieje, ale seed nie ma prostej ścieżki wgrania obrazu → hero zawsze startuje „goły".

### 2.2 Ikony: 8 generyków nie pasuje do żadnej branży
`star / heart / lightning / code` przy usługach stalowych („serce" przy zadaszeniach, „code" przy konstrukcjach) — to obniża wiarygodność. Enum 8 ikon to za mało dla jakiejkolwiek branży poza SaaS.

### 2.3 Realizacje bez galerii = najsłabsza podstrona
Dla firm portfolio-driven (budowlanka, stal, meble, remonty) galeria to **główny konwerter**. Boilerplate nie ma bloku galerii — strona „Realizacje" to karty tekstowe, czyli antyklimaks.

### 2.4 Wszystko wyśrodkowane, brak asymetrii
Każda sekcja: nagłówek na środku, grid pod spodem. Rytm jest, ale monotonny — nowoczesne strony łamią go choć raz (sekcja 2-kolumnowa treść|zdjęcie, wcięty grid, oversized numer).

### 2.5 Drobiazgi, które psują szlif
- Logo ucięte („STALMET Konstruk") — `Logo.tsx` ma `max-w-[12rem]`.
- Stopka: „Navigation"/„Contact" po angielsku na polskiej stronie; selektor motywu „Auto".
- CTA hero ma `rounded-lg` z komponentu, choć design chciał ostrych 4px (utility wygrywa z theme.css bez podbicia specyficzności).
- Ikona search + przełącznik EN w headerze — zbędne dla jednojęzycznej strony lokalnej firmy.

---

## 3. Zmiany do boilerplate'u (priorytetyzowane)

### P0 — największy zwrot z inwestycji

1. **Blok `Gallery`** (grid + lightbox, pole: zdjęcie, podpis, kategoria, filtr opcjonalny).
   Bez tego każda strona usługowo-rzemieślnicza będzie kulawa. Masonry lub równy grid 3-kol.
2. **Rozbudowa `GlassHero`**: pola `eyebrow` (text), `stats` (array: value+label, max 4), `align` (left/center), `accentWord` (które słowo headline'u dostaje kolor akcentu). Usunąć hardkod `text-center` → sterować przez `align` + klasy semantyczne.
3. **Ikony: zamienić enum na wolne pole `lucide` icon name** (string) z fallbackiem. Lucide ma ~1500 ikon — `fence`, `warehouse`, `hammer`, `shield-check` istnieją i pasują do branż.
4. **Media w seedzie: helper `uploadImageFromFile()`** + katalog `seed/images/` — żeby hero i galeria startowały ze zdjęciami (choćby AI-placeholder), nie z pustym gradientem. Pusta strona „bez zdjęć" wygląda na niedokończoną niezależnie od CSS.

### P1 — wyraźnie podnosi „modern"

5. **Blok `ProcessSteps`** (numer + tytuł + opis, 3–5 kroków): „Pomiar → Projekt → Wykonanie → Montaż". Prawie każda firma usługowa tego chce; mono-numeracja „01/02/03" za darmo daje spec-sheet vibe.
6. **Blok `StatsBar`** (liczby z animowanym licznikiem) — do użycia też poza hero.
7. **Sticky mobile CTA bar** (komponent globalny: telefon + „Wyceń") — był w PAGE_DESIGN, nie istnieje w boilerplate. Na mobile to najskuteczniejszy element strony usługowej.
8. **Zdjąć z komponentów utilities kolorów/układu** (`bg-primary` na ikonach, `bg-background` na hero-background, `opacity-80`, `rounded-lg/xl` na CTA) — zostawić TYLKO strukturę + klasy semantyczne. To jest deklarowany „blank canvas", w praktyce trzeba było walczyć specyficznością.
9. **i18n drobnic**: nagłówki stopki, „Auto" w theme-selectorze, `max-w` logo → konfigurowalne; opcjonalny flag ukrycia search/locale-switcher.

### P2 — szlif

10. **Blok `FAQ`** (accordion — Radix już jest w zależnościach).
11. **Blok `LogoCloud/Certyfikaty`** (atesty, uprawnienia, partnerzy) — trust dla B2B.
12. **Sekcja `SplitContent`** (tekst|zdjęcie 50/50 z przełączanym kierunkiem) — łamie monotonię centrowanych sekcji.
13. **Wariant `angled dividers`** (clip-path na styku sekcji) jako opt-in klasa w theme.

---

## 4. Techniki „modern" do stosowania w theme.css (niezależnie od zmian w kodzie)

Sprawdzone lub zaplanowane w tym projekcie — do ponownego użycia:

- **Ziarno/noise na dużych płaszczyznach**: SVG turbulence data-URI, opacity 2–3% — zabija „plastikową" płaskość ciemnych sekcji. Tani i bardzo skuteczny.
- **Skala typograficzna odważniej**: hero `clamp(3rem, 7vw, 5.5rem)` zamiast zachowawczych 4rem; sekcje H2 do 2.75rem. Duża typografia = największy „modern signal" za darmo.
- **Rytm sekcji 6–8rem** (`py-24`/`py-32`), nie 4rem — powietrze robi premium.
- **Numerowane eyebrow** przed H2: `01 — OFERTA` w mono, kolor muted, akcent na numerze.
- **Duotone na zdjęciach**: `filter: grayscale(1) + mix-blend / gradient overlay` w kolorze marki — spójna galeria nawet z niespójnych zdjęć klienta.
- **Hover z odkryciem** na kaflach galerii: zoom 1.04 + podpis wjeżdżający od dołu.
- **Oversized outline text** jako dekoracja tła sekcji (np. „STAL" 20vw, `-webkit-text-stroke`, opacity 4%) — jedna taka sekcja na stronę.
- **Jeden WOW max** (tu: laser-cut w hero, czysty CSS) — zasada się potwierdziła, trzymać.
- Pary kontrastu liczyć na etapie PAGE_DESIGN (nie w CSS) — w tym projekcie wymusiło to ciemny tekst na pomarańczowym CTA zamiast białego, który by nie przeszedł AA.

---

## 5. Checklist „czy design nie jest bezpieczny-nudny" (przed oddaniem)

- [ ] Czy jest przynajmniej JEDNA asymetryczna sekcja (nie wszystko centrowane)?
- [ ] Czy hero ma zdjęcie/teksturę, eyebrow i liczby — czy tylko tekst na gradiencie?
- [ ] Czy ikony pasują do branży (nie star/heart z defaultu)?
- [ ] Czy strona ma galerię/zdjęcia realnych realizacji (dla firm portfolio-driven)?
- [ ] Czy typografia hero robi wrażenie na mobile (min ~2.5rem)?
- [ ] Czy jest sticky CTA na mobile?
- [ ] Czy signature detail (kreska/pas/numeracja) powtarza się min. 3× dla spójności?
- [ ] Zrzut ekranu w OBU motywach — bug light/dark wyszedł dopiero na screenshocie, nie w HTML.
