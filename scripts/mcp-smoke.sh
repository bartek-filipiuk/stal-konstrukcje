#!/usr/bin/env bash
# Smoke test serwera MCP. Użycie: MCP_KEY=<klucz> ./scripts/mcp-smoke.sh [base-url]
set -euo pipefail

BASE="${1:-http://localhost:3000}"
KEY="${MCP_KEY:?Set MCP_KEY to an API key from admin panel (MCP -> API Keys)}"

call() {
  local method="$1" params="${2:-{\}}"
  # Accept z text/event-stream wymagany przez transport Streamable HTTP
  curl -sf "$BASE/api/mcp" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":\"1\",\"method\":\"$method\",\"params\":$params}"
}

echo "== initialize (negocjacja wersji protokolu) =="
# Klient prosi o 2026-07-28; serwer (SDK 1.27.1, max 2025-11-25) MUSI odpowiedziec
# swoja wersja zamiast bledu — to gwarantuje fallback nowych klientow Claude.
INIT=$(call initialize '{"protocolVersion":"2026-07-28","capabilities":{},"clientInfo":{"name":"mcp-smoke","version":"1.0"}}')
echo "$INIT" | grep -q '"protocolVersion"' || { echo "FAIL: initialize nie zwrocil protocolVersion"; exit 1; }

echo "== tools/list =="
TOOLS=$(call tools/list)
# Bashowe cięcie zamiast `| head -c` — head zamyka pipe i pod `pipefail` SIGPIPE
# wywracał cały skrypt (exit 141) mimo poprawnej odpowiedzi serwera.
echo "${TOOLS:0:2000}"

# Nazwy tooli, nie dowolne wystapienie slowa — "pages"/"posts" siedza tez w kazdym
# schemacie relacji, wiec luzny grep przechodzil nawet bez tooli dla tych kolekcji.
for expected in findPages createPages findPosts createPosts uploadMediaFromUrl markdownToRichText; do
  echo "$TOOLS" | grep -q "\"name\":\"$expected\"" || { echo "FAIL: missing tool '$expected'"; exit 1; }
done
# Czego temu serwerowi wystawic NIE WOLNO: kolekcje users i search (search jest
# pochodna postow, users to konta) oraz wbudowane toole pluginu bramkowane
# uprawnieniami klucza — modyfikacja configu/kolekcji, uruchamianie jobow i logowanie.
# Dzis wylaczone (nie ma ich w src/plugins/mcp.ts), ale odhaczenie ich na kluczu albo
# nowa wersja pluginu wpuscilaby je po cichu. Nazwy z dist pluginu (mcp/*Tool.js).
# Match po pelnej nazwie tools/list — golym substringiem "users" lapal sie enum ikon.
FORBIDDEN='(find|create|update|delete)(Users|Search)|createCollection|deleteCollection'
FORBIDDEN="$FORBIDDEN|updateCollection|findCollections|findConfig|updateConfig"
FORBIDDEN="$FORBIDDEN|createJob|updateJob|runJob|auth|login|verify|resetPassword|forgotPassword|unlock"
LEAKED=$(echo "$TOOLS" | grep -oE '"name":"[a-zA-Z]+"' | grep -E "\"name\":\"($FORBIDDEN)\"" || true)
if [ -n "$LEAKED" ]; then
  echo "FAIL: zabronione toole wystawione: $LEAKED"; exit 1
fi

echo "== resources/list =="
call resources/list | grep -q 'content-guide' || { echo "FAIL: content-guide resource missing"; exit 1; }

echo "OK: MCP smoke passed"
