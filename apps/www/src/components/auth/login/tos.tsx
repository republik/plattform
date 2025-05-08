import { useEffect, useRef } from 'react'

import Link from 'next/link'

import { css } from '@republik/theme/css'

import { useTranslation } from 'lib/withT'

export function Tos() {
  const tosRef = useRef<HTMLParagraphElement>(null)
  const { t } = useTranslation()

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
          lineHeight: 1.4,
        })}
      >
        {t.elements('auth/login/tos', {
          link: (
            <Link href='/datenschutz' target='_blank'>
              Datenschutz&shy;bestimmungen
            </Link>
          ),
        })}
      </p>
    </div>
  )
}
