import React from 'react'
import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'

/**
 * Sticky mobile CTA bar — phone + quote link, visible only below md.
 * The single highest-converting element on a local-services site.
 * Style via theme.css: .sticky-cta, .sticky-cta-phone, .sticky-cta-primary
 */
export async function StickyCTA() {
  const siteSettings = (await getCachedGlobal('site-settings', 1)()) as SiteSetting
  const phone = siteSettings?.contact?.phone

  return (
    <div className="sticky-cta md:hidden fixed bottom-0 left-0 right-0 z-40 flex">
      {phone && (
        <a href={`tel:${phone.replace(/[\s-]/g, '')}`} className="sticky-cta-phone">
          Zadzwoń
        </a>
      )}
      <Link href="/kontakt" className="sticky-cta-primary">
        Wyceń realizację
      </Link>
    </div>
  )
}
