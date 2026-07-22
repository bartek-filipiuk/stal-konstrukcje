import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

/**
 * Text logo. Splits the site name on the first space:
 * first word = primary mark, the rest = small suffix (hidden on mobile).
 * Sizes naturally — no fixed-width SVG, so long names don't truncate.
 * Style via theme.css: .site-logo, .site-logo-primary, .site-logo-suffix
 */
export const Logo = (props: Props) => {
  const { className } = props
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'My Website'
  const [primary, ...rest] = siteName.split(' ')
  const suffix = rest.join(' ')

  return (
    <span
      className={clsx('site-logo inline-flex items-baseline gap-2 whitespace-nowrap', className)}
      aria-label={siteName}
    >
      <span className="site-logo-primary text-2xl font-bold tracking-wide">{primary}</span>
      {suffix && <span className="site-logo-suffix hidden sm:inline">{suffix}</span>}
    </span>
  )
}
