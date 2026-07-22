import React from 'react'

import type { GalleryBlock as GalleryProps } from '@/payload-types'

import { Media } from '@/components/Media'

/**
 * Gallery Block - Minimal Structure
 *
 * Portfolio grid for trades/services sites. Items without an image render
 * a styled placeholder (see .gallery-placeholder in theme.css) so the page
 * looks intentional before the client delivers photos.
 *
 * CSS classes to customize in theme.css:
 * - .gallery-section, .gallery-header, .gallery-title, .gallery-description
 * - .gallery-grid, .gallery-item, .gallery-item-media, .gallery-placeholder
 * - .gallery-item-caption, .gallery-item-title, .gallery-item-category
 */
export const GalleryBlock: React.FC<GalleryProps> = ({
  sectionTitle,
  sectionDescription,
  items,
}) => {
  return (
    <section className="gallery-section py-20 relative">
      <div className="container">
        {(sectionTitle || sectionDescription) && (
          <div className="gallery-header mb-16">
            {sectionTitle && (
              <h2 className="gallery-title text-3xl md:text-4xl font-bold mb-4">{sectionTitle}</h2>
            )}
            {sectionDescription && (
              <p className="gallery-description text-lg text-muted-foreground max-w-2xl">
                {sectionDescription}
              </p>
            )}
          </div>
        )}

        <div className="gallery-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map((item, index) => (
            <figure key={index} className="gallery-item relative overflow-hidden">
              <div className="gallery-item-media relative aspect-[4/3]">
                {item.image && typeof item.image === 'object' ? (
                  <Media resource={item.image} fill className="object-cover" />
                ) : (
                  <div className="gallery-placeholder absolute inset-0" aria-hidden="true" />
                )}
              </div>
              <figcaption className="gallery-item-caption">
                <span className="gallery-item-title">{item.title}</span>
                {item.category && (
                  <span className="gallery-item-category">{item.category}</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
