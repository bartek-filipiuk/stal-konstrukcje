# Prompt: research-briefu → wypełniony `PAGE_DESCRIPTION.md`

**Co produkuje:** kompletny `PAGE_DESCRIPTION.md` w strukturze szablonu ze startera (BUSINESS DATA · OPENING HOURS · CUSTOMER REVIEWS · SERVICES · USP · TEAM · TARGET AUDIENCE · KEYWORDS (SEO) · COMMUNICATION TONE · WEBSITE GOALS). Wzór poziomu wypełnienia: `examples/ultra-mechanic/PAGE_DESCRIPTION.md`.

## Zanim odpalisz — przygotuj dane (im więcej, tym lepsza strona)

Prompt ZAPYTA Cię o braki, ale odpowiadanie „nie wiem" 10 razy da słaby brief. Minimum: **branża + miasto**. Zbierz, co masz:

- [ ] nazwa firmy (jeśli istnieje) / albo decyzja: firma fikcyjna wg speca
- [ ] link do wizytówki Google / strony / Facebooka / Instagrama
- [ ] telefon, mail, adres, godziny otwarcia
- [ ] lista usług + orientacyjne ceny (jeśli są)
- [ ] co wyróżnia firmę (choćby 1 rzecz — „u nas właściciel sam odbiera telefon")
- [ ] spec zlecenia (np. post z FB), jeśli budujesz pod zlecenie

## Jak użyć

**A. Narzędzie z dostępem do internetu (ZALECANE): Claude Code / Perplexity / agent z wyszukiwarką** — prompt wykona realny research (wizytówka, opinie, konkurencja). W Claude Code w katalogu projektu agent sam przeczyta szablon i NADPISZE `PAGE_DESCRIPTION.md`.

**B. Zwykły chat bez internetu (ChatGPT/Claude bez wyszukiwania)** — też zadziała, ale model NIE sprawdzi faktów o konkretnej firmie: dostaniesz szkielet z wiedzy o branży + oznaczone założenia. Wtedy Ty uzupełniasz fakty. Wklej prompt + zawartość szablonu `PAGE_DESCRIPTION.md` w oznaczonym miejscu.

---

## PROMPT (wklej wszystko od tego miejsca w dół)

Jesteś researcherem przygotowującym brief strony firmowej dla małej firmy. Twoim wynikiem końcowym jest kompletnie wypełniony plik `PAGE_DESCRIPTION.md`. Pracujesz wg kroków 0–3 PO KOLEI — nie przeskakuj do generowania pliku.

### KROK 0 — zadeklaruj tryb pracy (jedno zdanie, zanim cokolwiek zrobisz)

- Masz dostęp do internetu/wyszukiwarki? → napisz `TRYB: RESEARCH` i w kroku 2 wykonasz pełny research.
- Nie masz? → napisz `TRYB: WIEDZA` i graj czysto: opierasz się na wiedzy o BRANŻY, a każdą informację o KONKRETNEJ firmie, której nie dostałeś ode mnie, oznaczasz `[ZAŁOŻENIE]` albo `[DO POTWIERDZENIA: co i gdzie sprawdzić]`. W tym trybie NIE wolno Ci podawać „faktów" o firmie (opinie, ceny, rok założenia), których nie znasz.

### KROK 1 — zbierz dane od użytkownika (ZANIM zaczniesz research)

Oto co dostajesz ode mnie:

```
FIRMA / SPEC ZLECENIA:
[TU WKLEJ WSZYSTKO CO MASZ: nazwa, miasto, linki, telefon, usługi, ceny,
wyróżniki, spec zlecenia (np. treść posta z FB) — im więcej, tym lepiej.
W projekcie startera możesz napisać: "przeczytaj SPEC.md z tego katalogu"]
```

Przeanalizuj wsad i **zadaj mi maksymalnie 5 pytań domykających** — tylko o rzeczy, które realnie zmienią brief (np. „czy firma ma zdjęcia własnych realizacji?", „jaki obszar dojazdu?", „kto jest najczęstszym klientem: firmy czy osoby prywatne?"). **Zatrzymaj się i poczekaj na odpowiedzi.** Wyjątki: jeśli napisałem „generuj od razu" — pomiń pytania i pracuj na założeniach; jeśli firma jest fikcyjna wg speca — zamiast pytać, wymyśl REALISTYCZNE i spójne dane, a na górze pliku dopisz `> Firma demonstracyjna — dane fikcyjne.`

### KROK 2 — research (plan obowiązkowy w TRYBIE RESEARCH)

1. **Wizytówka Google firmy**: kategorie, usługi, godziny, zdjęcia. **Opinie: przeczytaj minimum 10** — wynotuj (a) powtarzające się pochwały → to są prawdziwe USP, (b) skargi → to pain points do zaadresowania na stronie, (c) 3 najlepsze cytaty do sekcji CUSTOMER REVIEWS (wierne lub wiernie sparafrazowane).
2. **Strona/social firmy** (jeśli istnieją): czego brakuje, co działa.
3. **3 lokalnych konkurentów** (ta sama branża + miasto): czym się chwalą na stronach, jakie mają CTA, czego NIE mają (Twoja przewaga).
4. **Frazy lokalne**: jak klient realnie szuka („mechanik Wrocław Fabryczna", nie „usługi motoryzacyjne premium") — do sekcji KEYWORDS.

W TRYBIE WIEDZA: wykonaj punkty 3–4 na wiedzy o branży (oznacz `[ZAŁOŻENIE]`), punkty 1–2 zamień na listę `[DO POTWIERDZENIA]` dla użytkownika.

### KROK 3 — wypełnij szablon

- Szablon: przeczytaj `PAGE_DESCRIPTION.md` z projektu + `examples/ultra-mechanic/PAGE_DESCRIPTION.md` jako wzór szczegółowości. (W chacie bez plików — szablon jest tu:)
```
[W TRYBIE CHATU WKLEJ TU CAŁY SZABLON PAGE_DESCRIPTION.md]
```
- **Struktura szablonu 1:1** — wszystkie sekcje i tabele, nagłówki bez zmian, po polsku.
- **Fakty ≠ domysły** — żadnego zmyślania NIP-u, cen, certyfikatów, danych kontaktowych.
- TARGET AUDIENCE: opisz człowieka (kto, czego szuka, czego się boi przed kontaktem) — z opinii i researchu, nie z sufitu.
- WEBSITE GOALS: **JEDNO** główne CTA (uzasadnij jednym zdaniem) + dokładnie **5 podstron** z nazwy + **1 integracja** (formularz ALBO link do zewnętrznego systemu rezerwacji). Bez sklepu, bez logowania.

### WYNIK

- Agent z dostępem do plików: **nadpisz `PAGE_DESCRIPTION.md`**; po zapisie wypisz TYLKO listę `[DO POTWIERDZENIA]`/`[ZAŁOŻENIE]` (co człowiek ma zweryfikować).
- Chat: **jeden blok markdown = pełna zawartość pliku**, nic poza nim; lista założeń jako sekcja `## DO POTWIERDZENIA` na końcu pliku.
