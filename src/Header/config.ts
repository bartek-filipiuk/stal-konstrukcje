import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'
import { authenticated } from '@/access/authenticated'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    // Bez jawnego `update` sanitizer globali wstawia defaultAccess (`Boolean(user)`),
    // a wtedy surowy klucz MCP PATCHuje globala przez REST z pominięciem scope'ów.
    update: authenticated,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
