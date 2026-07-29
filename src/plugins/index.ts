import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { mcpServerPlugin } from './mcp'
import { authenticated } from '@/access/authenticated'

// Kolekcje z pluginów definiują tylko `read`; resztę operacji sanitizer Payloada
// dociąga jako defaultAccess (`Boolean(user)`) — czyli surowy klucz MCP (globalna
// strategia API-Key) mógłby je CRUD-ować przez zwykły REST, omijając scope'y
// per-klucz. Zamykamy zapisy na realnego principala z `users`. Publiczne pozostają
// tylko te operacje, których potrzebuje frontend: read redirects/forms/search
// i create form-submissions (wysyłka formularza przez anonima).
const writeAccess = { create: authenticated, delete: authenticated, update: authenticated }

// Ta sama dziura, ale w kolekcjach rdzenia: `payload-folders` (Media ma folders: true)
// i `payload-locked-documents` startują z defaultAccess (`Boolean(user)`) na WSZYSTKICH
// operacjach — surowy klucz MCP mógłby nimi mieszać (przenoszenie mediów między folderami,
// zamykanie dokumentów na blokadach) przez zwykły REST. Payload dokłada te kolekcje dopiero
// w sanitizeConfig, czyli PO pluginach, więc jedyny moment na patch to onInit — access
// czytany jest w runtime z payload.collections[slug].config.access.
const lockdownCoreCollections: Plugin = (config) => ({
  ...config,
  onInit: async (payload) => {
    await config.onInit?.(payload)
    for (const slug of ['payload-folders', 'payload-locked-documents'] as const) {
      const collectionConfig = payload.collections[slug]?.config
      if (!collectionConfig) continue
      collectionConfig.access = {
        ...collectionConfig.access,
        create: authenticated,
        delete: authenticated,
        read: authenticated,
        update: authenticated,
      }
    }
  },
})

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

// Site name from environment variable or default
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'STALMET Konstrukcje Stalowe'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ${SITE_NAME}` : SITE_NAME
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      access: writeAccess,
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    // form-submissions: `create` zostaje publiczne (anonim wysyła formularz),
    // `update` plugin ma już na false. Domykamy `read` (to leady — PII, plugin
    // dawał samo `!!user`, więc surowy klucz je czytał) i `delete`.
    formSubmissionOverrides: {
      access: { delete: authenticated, read: authenticated },
    },
    formOverrides: {
      access: writeAccess,
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      // `create` plugin ma już na false, `read` publiczne (wyszukiwarka na froncie).
      access: { delete: authenticated, update: authenticated },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  mcpServerPlugin,
  lockdownCoreCollections,
]
