import React from 'react'

import type { ProcessStepsBlock as ProcessStepsProps } from '@/payload-types'

/**
 * ProcessSteps Block - Minimal Structure
 *
 * Numbered "how we work" steps (Pomiar → Projekt → Wykonanie → Montaż).
 * Numbers are rendered as 01/02/03… — style via theme.css (mono font).
 *
 * CSS classes to customize in theme.css:
 * - .process-section, .process-header, .process-title, .process-description
 * - .process-grid, .process-step, .process-step-number
 * - .process-step-title, .process-step-description
 */
export const ProcessStepsBlock: React.FC<ProcessStepsProps> = ({
  sectionTitle,
  sectionDescription,
  steps,
}) => {
  return (
    <section className="process-section py-20 relative">
      <div className="container">
        {(sectionTitle || sectionDescription) && (
          <div className="process-header mb-16">
            {sectionTitle && (
              <h2 className="process-title text-3xl md:text-4xl font-bold mb-4">{sectionTitle}</h2>
            )}
            {sectionDescription && (
              <p className="process-description text-lg text-muted-foreground max-w-2xl">
                {sectionDescription}
              </p>
            )}
          </div>
        )}

        <ol className="process-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps?.map((step, index) => (
            <li key={index} className="process-step relative">
              <span className="process-step-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="process-step-title text-xl font-semibold mb-2">{step.title}</h3>
              <p className="process-step-description text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
