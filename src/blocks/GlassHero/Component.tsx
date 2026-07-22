import React from 'react'

import type { GlassHeroBlock as GlassHeroProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

/**
 * GlassHero Block - Minimal Structure
 *
 * STRUCTURE only — visual styling lives in theme.css.
 * Alignment is data-driven (`align` field) instead of hardcoded utilities.
 *
 * CSS classes to customize in theme.css:
 * - .hero-section (+ .hero-align-left / .hero-align-center)
 * - .hero-background, .hero-overlay
 * - .hero-content, .hero-eyebrow, .hero-headline (+ span.accent)
 * - .hero-subheadline
 * - .hero-stats, .hero-stat, .hero-stat-value, .hero-stat-label
 * - .hero-cta-primary, .hero-cta-secondary
 */
export const GlassHeroBlock: React.FC<GlassHeroProps> = ({
  eyebrow,
  headline,
  accentWord,
  align,
  stats,
  subheadline,
  primaryCTA,
  secondaryCTA,
  backgroundMedia,
}) => {
  // Headline with optional accent fragment (first occurrence)
  const renderHeadline = () => {
    if (!headline) return null
    if (accentWord && headline.includes(accentWord)) {
      const idx = headline.indexOf(accentWord)
      return (
        <>
          {headline.slice(0, idx)}
          <span className="accent">{accentWord}</span>
          {headline.slice(idx + accentWord.length)}
        </>
      )
    }
    return headline
  }

  return (
    <section
      className={`hero-section hero-align-${align || 'left'} relative min-h-[85vh] flex items-center overflow-hidden`}
    >
      {/* Background layer - style via .hero-background in theme.css */}
      <div className="hero-background absolute inset-0" />

      {/* Background media if provided */}
      {backgroundMedia && typeof backgroundMedia === 'object' && (
        <div className="absolute inset-0">
          <Media
            resource={backgroundMedia}
            fill
            pictureClassName="absolute inset-0"
            className="object-cover"
            priority
          />
          {/* Overlay for text readability - customize in theme.css */}
          <div className="hero-overlay absolute inset-0" />
        </div>
      )}

      {/* Content container */}
      <div className="container relative z-10">
        <div className="hero-content max-w-4xl py-16 md:py-24">
          {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}

          {headline && <h1 className="hero-headline font-bold mb-6">{renderHeadline()}</h1>}

          {subheadline && (
            <div className="hero-subheadline text-lg md:text-xl mb-8 max-w-2xl">
              <RichText data={subheadline} enableGutter={false} />
            </div>
          )}

          {(primaryCTA?.label || secondaryCTA?.label) && (
            <div className="hero-cta-container flex flex-col sm:flex-row gap-4">
              {primaryCTA && primaryCTA.label && (
                <CMSLink
                  {...primaryCTA}
                  size="lg"
                  className="hero-cta-primary px-8 py-4 font-semibold"
                />
              )}
              {secondaryCTA && secondaryCTA.label && (
                <CMSLink
                  {...secondaryCTA}
                  size="lg"
                  className="hero-cta-secondary px-8 py-4 font-semibold"
                />
              )}
            </div>
          )}

          {stats && stats.length > 0 && (
            <div className="hero-stats">
              {stats.map((stat, i) => (
                <div key={i} className="hero-stat">
                  <span className="hero-stat-value">{stat.value}</span>
                  <span className="hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
