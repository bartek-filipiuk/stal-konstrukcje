import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'STALMET Konstrukcje Stalowe'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Konstrukcje stalowe, bramy, ogrodzenia, balustrady i zadaszenia. Swarzędz, Poznań i okolice.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: SITE_NAME,
  title: SITE_NAME,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
