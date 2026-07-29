import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminUser } from '../../access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Panel admina i zarządzanie kontami tylko dla roli admin — user-bot MCP
    // (rola editor) ma pisać treść, nie eskalować uprawnień.
    admin: isAdmin,
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: ({ req: { user }, id }) => {
      if (isAdminUser(user)) return true
      return user?.collection === 'users' && user.id === id
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      saveToJWT: true,
      access: {
        // Tylko admin nadaje/zmienia role — editor nie zrobi sobie admina
        create: ({ req: { user } }) => isAdminUser(user),
        update: ({ req: { user } }) => isAdminUser(user),
      },
    },
  ],
  timestamps: true,
}
