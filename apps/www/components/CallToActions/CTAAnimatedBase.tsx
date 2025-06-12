'use client'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useIntersectionObserver } from '../../lib/hooks/useIntersectionObserver'
import { motion } from 'motion/react'

type CTABaseProps = {
  children: ReactNode
  ctaId: string
} & Record<string, unknown>

const getStorageKey = (id: string) => `cta-${id}-rendered`

/**
 * A animated wrapper for call-to-actions to fade-in from the top once the page top is visited.
 * ⚠️ BE WARY ⚠️: This component uses motion/react's motion.div to animate the call-to-action.
 * the client-bundle will be rather large. load components using this wrapper only when needed.
 * And in best case behind a dynamic import or suspense-boundary.
 */
const CTAAnimatedBase = ({ children, ctaId, ...props }: CTABaseProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [renderedCta, setRenderedCTA] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      Boolean(sessionStorage.getItem(getStorageKey(ctaId))),
  )

  const [visitedPageTop, setVisitedPageTop] = useState(false)

  useEffect(() => {
    const persistedVal = sessionStorage.getItem(getStorageKey(ctaId))
    if (persistedVal) {
      setVisitedPageTop(Boolean(persistedVal))
    }
  }, [])

  useIntersectionObserver(ref, {
    callback: (value: boolean) => {
      if (value) {
        setVisitedPageTop(true)
      }
    },
    intersectionObserverOptions: {
      threshold: 0.5,
    },
  })

  return (
    <motion.div
      ref={ref}
      initial={
        renderedCta ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }
      }
      animate={visitedPageTop ? { opacity: 1, height: 'auto' } : undefined}
      transition={{ duration: 0.5, delay: 0.3, bounce: 0, ease: 'easeIn' }}
      onAnimationComplete={() => {
        setRenderedCTA(true)
        sessionStorage.setItem(getStorageKey(ctaId), 'true')
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default CTAAnimatedBase
