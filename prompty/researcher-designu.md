# Prompt: researcher-designu → wypełniony `PAGE_DESIGN.md`

**Co produkuje:** kompletny `PAGE_DESIGN.md` w strukturze szablonu ze startera (DESIGN CONCEPT · COLOR PALETTE · TYPOGRAPHY · VISUAL EFFECTS · COMPONENT STYLING · **PLACEHOLDER IMAGES ze shot-listą zdjęć** · RESPONSIVE · ACCESSIBILITY · WOW FACTORS · SUMMARY). Wzór: `examples/ultra-mechanic/PAGE_DESIGN.md`. Z tego pliku agent wygeneruje cały `theme.css` — ogólniki tutaj = nijaka strona tam.

## Zanim odpalisz — przygotuj (Krok B robisz PO wypełnieniu PAGE_DESCRIPTION!)

- [ ] wypełniony `PAGE_DESCRIPTION.md` (obowiązkowy wsad)
- [ ] logo firmy? jakie ma kolory? (jeśli jest — paleta MUSI z nim współgrać)
- [ ] 1–2 strony, które CI/klientowi się podobają (mogą być spoza branży) + co konkretnie się podoba
- [ ] preferencje klienta, jeśli znane (jasna/ciemna? kolor firmowy? czego nienawidzi?)
- [ ] jakimi zdjęciami dysponujesz (własne realizacje? nic?)

## Jak użyć

**A. Narzędzie z internetem (ZALECANE): Claude Code / Perplexity** — zrobi realny przegląd stron branżowych i da linki-referencje. W Claude Code agent NADPISZE `PAGE_DESIGN.md`.

**B. Chat bez internetu** — zadziała: model zna standardy branż, ale referencje poda z pamięci (mogą być nieaktualne — oznaczy je). Wklej prompt + swój PAGE_DESCRIPTION + szablon PAGE_DESIGN w oznaczonych miejscach.

---

## PROMPT (wklej wszystko od tego miejsca w dół)

Jesteś projektantem robiącym research kierunku wizualnego strony firmowej. Wynik końcowy: kompletnie wypełniony `PAGE_DESIGN.md`. Zakaz ogólników — „nowoczesny, minimalistyczny, profesjonalny" to nie są decyzje; decyzje to hexy, nazwy fontów, opisane efekty i konkretna lista zdjęć. Pracuj wg kroków 0–3 PO KOLEI.

### KROK 0 — zadeklaruj tryb

- Internet jest → `TRYB: RESEARCH` (referencje = realne, sprawdzone linki).
- Internetu brak → `TRYB: WIEDZA` (kierunek z wiedzy o branży; referencje z pamięci oznacz `[Z PAMIĘCI — zweryfikuj]`; żadnych zmyślonych URL-i).

### KROK 1 — wsad + pytania domykające

Brief firmy: przeczytaj `PAGE_DESCRIPTION.md` z projektu (w chacie — wklejony niżej):
```
[W TRYBIE CHATU WKLEJ PAGE_DESCRIPTION]
```
Dodatkowe informacje ode mnie:
```
[LOGO I JEGO KOLORY / STRONY KTÓRE MI SIĘ PODOBAJĄ + CO KONKRETNIE /
PREFERENCJE KLIENTA / JAKIE ZDJĘCIA MAM — wpisz co wiesz, choćby "nic nie mam"]
```

Jeśli czegoś kluczowego brakuje, **zadaj mi maksymalnie 3 pytania** (typowo: „jest logo i jakie ma kolory?", „strona raczej jasna czy ciemna?", „masz własne zdjęcia realizacji czy wszystko generujemy?"). **Zatrzymaj się i poczekaj.** Napisałem „generuj od razu"? — pracuj na założeniach, oznaczaj je.

### KROK 2 — research kierunku

1. **Standard branży**: znajdź 2–3 DOBRE strony firm z tej branży (szukaj: „najlepsze strony [branża]", galerie typu land-book/awwwards, konkurenci z PAGE_DESCRIPTION). Dla każdej: link + co z niej bierzemy (1 zdanie). Ustal, co strony branży mają wspólnego (paleta, klimat zdjęć, układ hero) — i JEDNĄ rzecz, której branża nadużywa, a my ją świadomie pomijamy.
2. **Idea przewodnia**: jedno zdanie łączące branżę + ton marki z briefu (np. „warsztatowa solidność: grafit stali + pomarańcz ostrzegawczy jak na maszynach"). To zdanie ma sterować KAŻDĄ decyzją niżej.
3. Logo istnieje? Paleta wychodzi OD kolorów logo, nie obok nich.

### KROK 3 — wypełnij szablon (1:1, każda sekcja)

- Szablon: przeczytaj `PAGE_DESIGN.md` (szablon startera) + wzór `examples/ultra-mechanic/PAGE_DESIGN.md`. (W chacie:)
```
[W TRYBIE CHATU WKLEJ SZABLON PAGE_DESIGN.md]
```
- **COLOR PALETTE**: dokładne hexy z rolami; JEDEN akcent CTA mocno kontrastujący z tłem i primary; kontrast tekst/tło min. WCAG AA (podaj wyliczone pary).
- **TYPOGRAPHY**: fonty tylko z Google Fonts, każdy z uzasadnieniem połową zdania + skala (hero/h2/body w px).
- **VISUAL EFFECTS / COMPONENT STYLING**: opisz tak, żeby ktoś bez dostępu do Twojej głowy zbudował DOKŁADNIE to (agent zrobi dosłownie to, co napiszesz — nic więcej). Czego świadomie NIE robimy — wpisz „brak" wprost.
- **PLACEHOLDER IMAGES → zrób z tej sekcji SHOT-LISTĘ ZDJĘĆ** — dla każdej z 5 podstron z briefu wypisz w tabeli:

| Miejsce (podstrona → sekcja) | Co na zdjęciu (kadr, orientacja) | Skąd wziąć |
|---|---|---|
| Główna → hero | np. „hala z konstrukcją stalową w budowie, szeroki kadr, poziome, przyciemnione pod tekst" | własne klienta / AI / stock: fraza |

  - „Skąd wziąć": najpierw ZDJĘCIA WŁASNE klienta (jeśli brief mówi, że są — np. realizacje), potem AI, potem stock (podaj frazę do szukania).
  - Dla 2–3 NAJWAŻNIEJSZYCH zdjęć (hero + 1–2 sekcje) napisz **gotowy prompt do generatora obrazów** (po angielsku, ze stylem, światłem i kadrem, spójny z ideą przewodnią).
  - Zaznacz, które zdjęcia są krytyczne (bez nich strona wygląda pusto), a które opcjonalne.
- **WOW FACTORS**: maksymalnie JEDEN, wykonalny w CSS (bez bibliotek) — reszta to spójność, nie fajerwerki.

### WYNIK

- Agent: **nadpisz `PAGE_DESIGN.md`**; po zapisie wypisz TYLKO: idea przewodnia (1 zdanie) + linki referencji + liczba zdjęć na shot-liście (krytyczne/opcjonalne).
- Chat: **jeden blok markdown = pełna zawartość pliku**, nic poza nim.
