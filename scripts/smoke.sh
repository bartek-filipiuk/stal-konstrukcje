#!/usr/bin/env bash
# Smoke-test strony: każda podstrona 2× (1. przebieg kompiluje route, 2. łapie
# stale-webpack — błąd "__webpack_modules__[moduleId] is not a function" potrafi
# wystąpić dopiero przy renderze skompilowanej trasy). Exit != 0 przy jakimkolwiek nie-200.
#
# Użycie: scripts/smoke.sh [PORT] [LOG_DEV]
#   PORT    — port dev (domyślnie 3005)
#   LOG_DEV — opcjonalna ścieżka do logu dev; jeśli podana, grepujemy znane błędy
set -u
PORT="${1:-3005}"
LOG="${2:-}"
PAGES=("" "oferta" "realizacje" "o-firmie" "kontakt")
FAIL=0

for pass in 1 2; do
  echo "— przebieg $pass —"
  for p in "${PAGES[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 90 "http://localhost:$PORT/$p")
    if [ "$code" = "200" ]; then
      echo "  OK  /$p"
    else
      echo "  FAIL /$p -> $code"
      FAIL=1
    fi
  done
done

if [ -n "$LOG" ] && [ -f "$LOG" ]; then
  if grep -qE "__webpack_modules__|upstream image response failed|ECONNREFUSED" "$LOG"; then
    echo "— BŁĘDY W LOGU DEV: —"
    grep -E "__webpack_modules__|upstream image response failed|ECONNREFUSED" "$LOG" | sort -u | head -5
    echo "  → lek: rm -rf .next && restart dev (PAGE_DEVTIPS Field Note N)"
    FAIL=1
  else
    echo "log dev czysty ✅"
  fi
fi

[ "$FAIL" = 0 ] && echo "SMOKE OK ✅" || echo "SMOKE FAILED ❌"
exit $FAIL
