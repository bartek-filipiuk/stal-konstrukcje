import type { Access, TypedUser } from 'payload'

// Od plugin-mcp `req.user` to unia User | PayloadMcpApiKey — klucz API nie ma
// pola `role`, więc dyskryminujemy po `collection`. Klucz MCP nigdy nie jest adminem.
export const isAdminUser = (user: TypedUser | null | undefined): boolean =>
  user?.collection === 'users' && user.role === 'admin'

// `satisfies` zamiast adnotacji: zwrotka zawęża się do boolean, więc isAdmin
// wchodzi też w `access.admin` (które nie przyjmuje Where z typu Access).
export const isAdmin = (({ req: { user } }) => isAdminUser(user)) satisfies Access
