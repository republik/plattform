import { useEffect, useRef } from 'react'

import Link from 'next/link'

import { css } from '@republik/theme/css'

export function Tos() {
  const tosRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (tosRef.current) {
      tosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  return (
    <div ref={tosRef}>
      <p
        className={css({
          opacity: 0,
          animationName: 'fadeIn',
          animationTimingFunction: 'ease-in-out',
          animationDuration: '500ms',
          animationFillMode: 'forwards',
          animationDelay: '200ms',
        })}
      >
        Mit der Anmeldung akzeptieren Sie die{' '}
        <Link href='/datenschutz' target='_blank'>
          Datenschutz&shy;bestimmungen
        </Link>{' '}
        und sind einverstanden E-Mails zu Republik-Angeboten zu erhalten.
      </p>
    </div>
  )
}
