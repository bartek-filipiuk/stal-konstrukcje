# Prompt: tresci-stron → plik `TRESCI-STRON.md` (teksty 5 podstron ze slotami)

**Co produkuje:** plik `TRESCI-STRON.md` w katalogu projektu — treści wszystkich 5 podstron, gotowe do redakcji i wklejenia do CMS. Surowego outputu NIE wkleja się do CMS — najpierw redakcja + wypełnienie slotów.

## Jak użyć

**A. W Claude Code** — w katalogu projektu (po PAGE_DESCRIPTION): agent przeczyta brief i ZAPISZE `TRESCI-STRON.md`.
**B. W chacie** — wklej prompt + PAGE_DESCRIPTION; wynik (jeden blok markdown) zapisz jako `TRESCI-STRON.md`.

---

## PROMPT (wklej od tego miejsca)

Napisz treści strony firmowej po polsku, na podstawie briefu poniżej. Piszesz dla klienta końcowego tej firmy — prosto, konkretnie, bez marketingowej waty.

### Wsad

Przeczytaj `PAGE_DESCRIPTION.md` z projektu (w chacie — wklejony niżej). Strukturę 5 podstron i główne CTA bierz Z BRIEFU (sekcja WEBSITE GOALS), niczego nie wymyślaj od nowa.
"""
[W TRYBIE CHATU WKLEJ PAGE_DESCRIPTION]
"""

## Zasady pisania (twarde)

1. **Prosto**: krótkie zdania przeplatane dłuższymi. Zero słów-wydmuszek: „kompleksowy", „innowacyjny", „najwyższa jakość", „szeroka gama", „wychodzimy naprzeciw". Jeśli zdanie pasowałoby do KAŻDEJ firmy — skasuj je.
2. **Konkrety zamiast przymiotników**: nie „duże doświadczenie", tylko „od 2011 roku", nie „szybko", tylko „wycena w 24 h" (bierz z briefu; jeśli konkretu brak → slot, patrz niżej).
3. **Sloty na prawdę** — w miejscach, gdzie osobisty konkret wzmocniłby tekst, NIE zmyślaj. Wstaw slot z podpowiedzią:
   `[TWOJA HISTORIA: np. najtrudniejsza realizacja i co z niej wyszło — 2 zdania]`
   `[KONKRET: liczba realizacji / lat / klientów — jeśli znasz]`
   Minimum 3 sloty na całość, w sensownych miejscach (o firmie, główna, oferta).
4. **Każda podstrona prowadzi do CTA** z briefu — naturalnie, nie nachalnie (1 wezwanie na podstronę + kontakt w stopce).
5. Nagłówki mówią, co klient ZYSKUJE, nie czym firma „jest".

## Format wyniku

Dla każdej z 5 podstron z briefu:

```markdown
## [Nazwa podstrony]

### Nagłówek hero
[1 linia]

### Podtytuł
[1–2 zdania]

### Sekcje
[treść sekcji tej podstrony — tytuły + akapity/listy, gotowe do wklejenia w CMS]

### CTA tej podstrony
[tekst przycisku + 1 zdanie zachęty]

### Meta
- Title (≤60 znaków):
- Description (≤155 znaków):
```

Na końcu pliku: sekcja `## SLOTY DO WYPEŁNIENIA` — wszystkie sloty zebrane w jednym miejscu (żeby wypełnić je za jednym posiedzeniem).

### Wynik

- Agent: **zapisz plik `TRESCI-STRON.md`** w katalogu projektu; po zapisie wypisz TYLKO liczbę slotów do wypełnienia.
- Chat: **jeden blok markdown** = pełna zawartość pliku, nic poza nim.
