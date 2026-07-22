# Prompt: audyt-strony → raport przed publikacją

Dla agenta w katalogu projektu (Claude Code), gdy strona działa lokalnie. Agent RAPORTUJE — nie naprawia bez pytania. Ty i tak sam sprawdzasz sekcję „ręcznie".

---

Zrób audyt tej strony przed publikacją. Przejdź checklistę punkt po punkcie, dla każdego podaj: ✅/❌ + dowód (co sprawdziłeś, w którym pliku/URL). NICZEGO nie naprawiaj bez mojej zgody — najpierw pełny raport.

## A. Blokujące

**Działanie**
- [ ] wszystkie linki nawigacji i stopki prowadzą do istniejących stron (zero `#`, zero 404) — przeklikaj lokalnie
- [ ] główne CTA jest na każdej podstronie i działa
- [ ] formularz: wysyła, walidacja pól działa, po wysłaniu jest potwierdzenie dla użytkownika
- [ ] telefon `tel:` i mail `mailto:` klikalne
- [ ] strona 404 istnieje i linkuje do głównej

**Treść**
- [ ] zero lorem ipsum, placeholderów i niewypełnionych slotów `[TWOJA HISTORIA…]`
- [ ] dane kontaktowe identyczne we wszystkich miejscach (porównaj stopkę/kontakt/nagłówek znak po znaku)

**Technika**
- [ ] konsola przeglądarki bez błędów na każdej podstronie
- [ ] meta title + description unikalne per podstrona; OG title/description/image ustawione
- [ ] favicon jest (nie domyślny)
- [ ] **security-light**: żadnych sekretów poza `.env` (grep po repo: klucze, hasła, tokeny); `.env` w `.gitignore`; formularz waliduje dane wejściowe serwerowo; brak kluczy API w kodzie frontendowym

**Zgodność z designem**
- [ ] porównaj screenshot strony głównej z PAGE_DESIGN.md — wypisz każdy rozjazd (kolory, fonty, odstępy)

## B. Mile widziane (raportuj, nie blokuje)

- [ ] obrazy zoptymalizowane (waga strony głównej, LCP)
- [ ] alt na zdjęciach, kontrast tekstów AA, focus na elementach klikalnych
- [ ] sitemap się generuje

## Format raportu

```
## Raport audytu — [data]
### Blokujące: X/Y ✅
[tabela: punkt | status | dowód]
### Do naprawy (blokujące ❌): ponumerowana lista z propozycją naprawy (1 zdanie każda)
### Mile widziane: co warto, co odpuścić
```

**Zapisz raport do pliku `AUDYT.md`** w katalogu projektu (dowód wykonania — w sprincie to część Definition of Done). Po zapisie zapytaj, które punkty naprawić — i naprawiaj po JEDNYM, z commitem po każdym.

---

**Ręcznie (człowiek, nie agent)**: mobile na realnym telefonie, formularz na własny mail, „czytanie na głos" tekstów, pytania do klienta z `kurs/checklista-jakosci.md` sekcja C.
