import React, { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  animation?: string
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
  className?: string
}

/**
 * ScrollReveal - Minimal Wrapper
 *
 * This component now just renders children without animation.
 * If you want scroll reveal animations, add them via theme.css
 * or implement a custom version based on PAGE_DESIGN.md requirements.
 *
 * The component is kept as a pass-through to avoid breaking imports.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>
}
