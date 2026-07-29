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
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Pierwszy user w pustej bazie MUSI być adminem. Pole `role` jest
        // niezapisywalne dla niezalogowanego (field access), więc bez tego
        // create-first-user zapisuje default 'editor' → nikt nie wejdzie do
        // panelu (access.admin = isAdmin) i ratunkiem jest tylko SQL.
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users' })
        if (totalDocs === 0) return { ...data, role: 'admin' }
        return data
      },
    ],
  },
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
