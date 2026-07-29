# MCP Guide — sterowanie treścią strony przez chat/CLI

Każda strona zbudowana na tym boilerplate wystawia własny serwer MCP pod
`https://stal.qaci.pl/api/mcp`. Po spięciu klienta (Claude Code, Claude Desktop,
n8n, dowolne narzędzie mówiące MCP po Streamable HTTP) zarządzasz całą
treścią strony rozmową: podstrony, wpisy bloga, obrazy, menu, stopka,
ustawienia, przekierowania, formularze.

---

## Część 1 — Spięcie MCP ze stroną (raz, ~5 minut)

### Krok 1. User-bot

Seed tworzy go automatycznie (`mcp-agent@stal.qaci.pl`, rola `editor`).
Na stronie już wdrożonej (bez ponownego seedu) utwórz ręcznie w panelu:

1. `https://stal.qaci.pl/admin` → **Users → Create New**
2. Email: `mcp-agent@stal.qaci.pl`, hasło: dowolne losowe (nie będzie używane),
   rola: **Editor** — nigdy Admin (toole MCP działają z uprawnieniami tego
   usera; editor pisze treść, nie zarządza kontami ani seedem).

### Krok 2. Klucz API

**Panel** (na produkcji): `admin → MCP → API Keys → Create New` →
przypnij klucz do usera-bota → **odhacz uprawnienia** (patrz niżej) →
zapisz i skopiuj klucz (pokazywany raz).

**Skrypt** (lokalnie / na serwerze z dostępem do repo):

```bash
pnpm payload run scripts/create-mcp-key.ts "moj-klucz"
# znajduje bota po emailu, odmawia przypięcia do admina,
# nadaje minimalny komplet uprawnień, drukuje klucz raz
```

**Pułapka nr 1:** checkboxy kolekcji i globali startują z **FALSE** —
świeży klucz bez odhaczenia niczego nie znajdzie ani nie zapisze.
Odhacz: pages, posts, media, categories, redirects, forms (CRUD),
form-submissions (tylko find), header/footer/site-settings (find+update).
Toole (`uploadMediaFromUrl`, `markdownToRichText`) i resource
(`contentGuide`) startują z TRUE — zostaw.

### Krok 3. Podpięcie klienta

**Claude Code** (CLI):

```bash
claude mcp add --transport http <nazwa-strony> https://stal.qaci.pl/api/mcp \
  --header "Authorization: Bearer <klucz>"
```

**Claude Desktop** — Settings → Connectors → Add custom connector,
URL `https://stal.qaci.pl/api/mcp`, header `Authorization: Bearer <klucz>`
(albo wpis w konfigu JSON, jeśli używasz pliku).

**n8n / własne skrypty** — węzeł/klient MCP ze Streamable HTTP:
URL jak wyżej + ten sam nagłówek. Uwaga: każdy request musi mieć też
`Accept: application/json, text/event-stream`.

**Inne narzędzia** — wszystko co wspiera "remote MCP server (HTTP)"
z własnym nagłówkiem auth zadziała tak samo.

### Krok 4. Weryfikacja

```bash
MCP_KEY=<klucz> ./scripts/mcp-smoke.sh https://stal.qaci.pl
# oczekiwane: "OK: MCP smoke passed"
```

Smoke sprawdza: negocjację protokołu, obecność tooli treści, NIEobecność
tooli zakazanych (users/search/config/collection/job/auth), resource
content-guide.

---

## Część 2 — Sterowanie treścią przez chat/CLI

### Jak to działa

Klient widzi toole nazwane `find|create|update|delete` + kolekcja
w PascalCase: `findPages`, `createPages`, `updatePosts`, `deleteMedia`,
`updateHeader`, `findSiteSettings`… Schemat pól (w tym listę dostępnych
bloków strony) agent bierze z `inputSchema` w `tools/list` — nie musisz
mu nic tłumaczyć. Na start warto poprosić: **"przeczytaj resource
content-guide"** — to instrukcja anty-błędowa (wymagane pola, workflow,
pułapki).

### Przykładowe polecenia (piszesz normalnie, po ludzku)

| Chcesz | Mówisz np. |
|---|---|
| Nowa podstrona | „Dodaj podstronę /uslugi: hero z nagłówkiem X, sekcja features z 4 kafelkami o…, na końcu CTA z telefonem. Na razie jako draft." |
| Publikacja | „Wygląda dobrze — publikuj /uslugi." |
| Edycja treści | „Na stronie głównej zmień nagłówek hero na «…» i popraw literówkę w sekcji opinii." |
| Wpis bloga | „Dodaj wpis bloga z tego markdowna: … Tytuł: …, kategoria: Poradniki, opublikuj." |
| Obrazy | „Wgraj obraz z https://…/foto.jpg z altem «hala stalowa» i ustaw go jako tło hero na /realizacje." |
| Menu / stopka | „Dodaj do menu link do /uslugi po «O nas». W stopce zmień telefon na +48…" |
| Ustawienia | „Zmień adres firmy w ustawieniach strony na…" |
| Przekierowania | „Ustaw redirect z /stara-oferta na /uslugi." |
| Leady | „Pokaż zgłoszenia z formularza kontaktowego z tego tygodnia." |
| Porządki | „Usuń draft /test-strona i nieużywane obrazy, które wgrałem godzinę temu." |

### Workflow, który agent zna z content-guide

1. `tools/list` → schemat pól i bloków (źródło prawdy).
2. Obrazy najpierw (`uploadMediaFromUrl` → ID), potem strona.
3. Rich text zawsze przez `markdownToRichText` — nigdy ręczny JSON.
4. Strony/wpisy jako **draft** (`_status: "draft"`), po weryfikacji
   `update` z `_status: "published"`. Publikacja sama odświeża cache
   Next.js — zmiana jest widoczna od razu.

### CLI bez chatu (skrypty/automatyzacje)

Goły JSON-RPC, np. lista podstron:

```bash
curl -s https://stal.qaci.pl/api/mcp \
  -H "Authorization: Bearer $MCP_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/call",
       "params":{"name":"findPages","arguments":{"limit":10}}}'
```

Uwaga: `tools/call` zwraca prozę z blokami ` ```json ` — w skryptach
parsuj blok ogrodzony, nie całość.

### Czego przez MCP NIE zrobisz (celowo)

- **Users, klucze API, seed** — niedostępne; wyciek klucza ≠ przejęcie
  panelu ani wipe bazy.
- **Surowy klucz na zwykłym REST** (`/api/pages` itd.) — odbity; klucz
  działa wyłącznie przez `/api/mcp`.
- **Search** — kolekcja pochodna, aktualizuje się sama.

### Troubleshooting

| Objaw | Przyczyna |
|---|---|
| 401 | Brak/zły nagłówek `Authorization: Bearer <klucz>` |
| 406 | Brak `Accept: application/json, text/event-stream` |
| Klucz działa, ale toole „nie widzą" kolekcji | Checkboxy uprawnień na kluczu = FALSE (pułapka nr 1) |
| „not allowed" przy tworzeniu strony | Klucz nieprzypięty do usera-bota albo bot bez roli |
| Agent wymyśla pola | Każ mu przeczytać `content-guide` i `inputSchema` z tools/list |

---

Referencja techniczna (kolekcje, access, architektura): `PAGE_BOILERPLATE.md`
sekcja "MCP Server" oraz `AGENTS.md`. Konfiguracja serwera: `src/plugins/mcp.ts`.
