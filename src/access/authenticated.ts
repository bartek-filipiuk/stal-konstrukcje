import type { Access } from 'payload'

// `Boolean(user)` byłoby dziurą: plugin-mcp rejestruje GLOBALNĄ strategię API-Key,
// więc surowy klucz MCP uwierzytelnia się na KAŻDEJ trasie REST/GraphQL
// (`Authorization: payload-mcp-api-keys API-Key <key>`) — z pominięciem scope'ów
// per-klucz. Wymagamy realnego principala z kolekcji `users`; toole MCP przechodzą,
// bo plugin podstawia powiązanego usera (`user.collection = 'users'`) przed ich
// uruchomieniem. Blokowany jest tylko bezpośredni REST surowym kluczem.
// Alias `AccessArgs<User>` zniknął celowo — pod unią TypedUser był nieprawdą.
export const authenticated: Access = ({ req: { user } }) => user?.collection === 'users'
