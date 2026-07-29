import type { Access } from 'payload'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  // Ta sama dziura co w `authenticated`: samo `if (user)` przepuszczałoby surowy
  // klucz MCP na REST do draftów. Draft widzi tylko realny user z `users`.
  if (user?.collection === 'users') {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
