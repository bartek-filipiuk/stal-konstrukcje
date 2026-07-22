# START — ściąga (pełny manual: ~/business-projects/strona-firmowa-kurs-ai/examples/INSTRUKCJA.md)

## Stan: kroki 0–1 ZROBIONE (22.07)
Boilerplate skopiowany, .env gotowy (sekret wygenerowany), Postgres w dockerze
na porcie 5441, SPEC.md (zlecenie z FB) w katalogu.

## Odpalanie po restarcie kompa
    cd ~/demo-projects/stal-konstrukcje
    docker compose up -d      # baza (5441)
    pnpm dev                  # → http://localhost:3000  (admin: /admin)

## Kroki (prompty: ~/business-projects/strona-firmowa-kurs-ai/examples/prompty/)
A. /admin → załóż konto admina (raz).
B. `claude` w tym katalogu → prompt `research-briefu.md`
   (wsad: "przeczytaj SPEC.md, wariant A") → agent nadpisze PAGE_DESCRIPTION.md
   → przejrzyj, popraw min. 2 rzeczy. Potem `researcher-designu.md` → PAGE_DESIGN.md.
   git add -A && git commit -m "brief + design"
C. Build — wklej agentowi:
   "Przeczytaj CLAUDE.md, potem SETUP_PROMPT.md i wykonaj jego kroki 1–5
    na podstawie PAGE_DESCRIPTION.md i PAGE_DESIGN.md. Pracuj MAŁYMI krokami:
    po każdym kroku zatrzymaj się, pokaż zmiany i czekaj na moje OK."
   Commit po każdym kroku. Wykolejenie → git reset --hard, mniejszy krok.
D. Treści: prompt `tresci-stron.md` → TRESCI-STRON.md → redakcja + sloty → wklej w /admin.
E. Audyt: prompt `audyt-strony.md` → AUDYT.md → naprawy PO JEDNYM. Mobile na telefonie.
F. Deploy: zawołaj Claude'a w projekcie kursu (Coolify).

## Gdy coś nie działa
PAGE_DEVTIPS.md → wklej pełny błąd agentowi → dopiero potem grzeb sam.
