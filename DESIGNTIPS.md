# DESIGNTIPS — checklista QA designu (przed oddaniem KAŻDEJ strony)

> Uzupełnia `DESIGN_IMPROVEMENTS.md` (tam: jak projektować, żeby nie było nudno).
> Tu: **mechaniczne checki jakości** — rzeczy, które psują odbiór, a łatwo je przegapić.
> Każdy punkt ma metodę sprawdzenia. Odhaczaj przy weryfikacji (FAZA 4 z INIT_PROMPT).

---

## 1. Typografia × polskie znaki ⚠️ (realny bug z projektu stal-konstrukcje)

- [ ] **Line-height nagłówków ≥ 1.12** przy wersalikach. Polskie diakrytyki (Ó Ś Ż Ź Ć Ń)
      siedzą NAD wysokością wersalika — przy `line-height: 1.0–1.05` ogonek Ó z drugiego
      wiersza nachodzi na litery pierwszego.
      **Jak sprawdzić:** hero z łamanym dwuwierszowym tytułem zawierającym Ó/Ż — zrzut ekranu, patrz na styk wierszy.
- [ ] **Font ma `latin-ext`** i jest ładowany z tym subsetem (`subsets: ['latin','latin-ext']`).
      **Jak:** wyrenderuj „ZAŻÓŁĆ GĘŚLĄ JAŹŃ / zażółć gęślą jaźń" w każdym foncie (heading, body, mono) — szukaj tofu i podmienionych glifów.
- [ ] **Uppercase + letter-spacing:** rozstrzelenie >0.1em przy długich polskich słowach
      („REALIZACJĘ") potrafi rozjechać przyciski — sprawdź najdłuższy label CTA na mobile.
- [ ] Liczby w statystykach: font mono/tabular — żeby „15" i „60 km" miały równy rytm.

## 2. Spójność brandu (header ↔ stopka ↔ favicon) ⚠️ (realny bug: `dark:invert`)

- [ ] **Logo IDENTYCZNE w headerze i stopce** — ten sam komponent, te same kolory, ta sama
      waga fontu i znaczek. Zdradliwe: klasy-relikty typu `dark:invert`/`brightness` na jednej
      z instancji (u nas invert robił z pomarańczowego kwadracika niebieski w headerze).
      **Jak:** zrzut headera i stopki obok siebie + `getComputedStyle` koloru obu instancji.
- [ ] Kolor akcentu 1:1 wszędzie (CTA, linki, gwiazdki, kreski) — żadnych „prawie takich samych" pomarańczy.
- [ ] Favicon podmieniony (nie domyślka boilerplate'u) i zgodny z paletą.
- [ ] Długa nazwa firmy: logo się nie ucina (header desktop i mobile), tytuł karty przeglądarki OK.

## 3. Motywy i kontrast

- [ ] Zrzut ekranu **w OBU motywach** (przełącznik w stopce) — bug motywu widać tylko wizualnie, nie w HTML.
- [ ] Pary kontrastu z PAGE_DESIGN potwierdzone na żywej stronie (DevTools → contrast ratio na body, muted, CTA).
- [ ] Tekst na zdjęciach: overlay ≥ 60% i test na NAJJAŚNIEJSZYM fragmencie zdjęcia (nie na średniej).
- [ ] Elementy „theme-aware" z lokalnym data-theme (np. header z HeaderTheme) sprawdzone osobno — mogą mieć inny motyw niż `<html>`.

## 4. Stany interakcji

- [ ] Hover na WSZYSTKIM klikalnym (karty, linki, ikony social, nav) — nic nie jest „martwe".
- [ ] Focus-visible widoczny (tab przez stronę klawiaturą — obwódka w kolorze akcentu).
- [ ] Linki tel:/mailto: naprawdę działają (klik, nie tylko wygląd) i numer nie zawiera spacji w href.
- [ ] `prefers-reduced-motion`: treść widoczna OD RAZU (uwaga na `animation-delay` + `both`).

## 5. Rytm i układ

- [ ] Odstępy sekcji z jednej skali (np. wszystkie py-20/24) — żadna sekcja nie „skleja się" z sąsiadem.
- [ ] Numeracja sekcji (jeśli jest) ciągła i poprawna na KAŻDEJ podstronie osobno (CSS counter liczy per strona).
- [ ] Sygnaturowy detal (kreska/pas/numeracja) powtarza się min. 3× — spójność, nie przypadek.
- [ ] Ostatnia sekcja przed stopką ≠ ta sama co pierwsza po hero (monotonia bloków).

## 6. Obrazy

- [ ] Hero: kompozycja pod tekst — strefa tekstu na ciemnej/pustej części zdjęcia (obiekt po przeciwnej stronie niż treść).
- [ ] Zdjęcia AI: bez twarzy na wprost (uncanny), bez tekstu/logo/watermarków w kadrze, bez „AI-plastiku" (tryb raw/fotograficzny).
- [ ] `alt` na wszystkich obrazach; media serwują się z właściwego hosta (sprawdź konsolę — mixed port/host = 500-tki z next/image).
- [ ] Placeholder tam, gdzie brak zdjęć klienta, wygląda CELOWO (etykieta, wzór), nie jak dziura.

## 7. Mobile (390px)

- [ ] Zero poziomego scrolla (`document.documentElement.scrollWidth === innerWidth`).
- [ ] H1 ≥ 32px, body ≥ 16px, touch targets ≥ 44px.
- [ ] Sticky CTA: widoczny, nie zasłania stopki (padding-bottom na stopce), safe-area na iPhone.
- [ ] Dekoracje (oversized text, siatki) nie wystają poza viewport (`overflow: hidden` na sekcji).

## 8. Treść i mikrocopy

- [ ] Zero angielskich resztek UI na polskiej stronie („Navigation", „Contact", „Auto", „Subscribe…").
- [ ] Przyciski mówią co robią („Wyceń realizację", nie „Wyślij"/„OK").
- [ ] Tytuł SEO = nazwa firmy (grep: żadnego „Payload Website Template").
- [ ] Dane kontaktowe spójne wszędzie (hero/stopka/kontakt — jeden numer, jeden mail).

---

## Jak odpalać (szybki rytuał, ~10 min)

1. Desktop full-page screenshot: home + każda podstrona → przejdź punkty 1–6.
2. Przełącz motyw → drugi zrzut home.
3. Zwęź do 390px (lub emulacja) → punkt 7.
4. Tab klawiaturą przez home → punkt 4.
5. Konsola przeglądarki: musi być PUSTA (warningi next/image i 500-tki to realne bugi, nie szum).
