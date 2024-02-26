'use client'
import { css } from '@app/styled-system/css'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRef, useState } from 'react'
import useResizeObserver from 'use-resize-observer'

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false })

const COLORS = ['rgb(229,1,70)', '#FFFDF0']

export const Success = ({
  referred,
  hasMonthlyAbo,
  hasRegularAbo,
}: {
  referred: number
  hasMonthlyAbo?: boolean
  hasRegularAbo?: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [source, setSource] = useState(null)
  useResizeObserver({
    ref,
    onResize: ({ width }) => {
      if (ref.current) {
        const rect = ref.current?.getBoundingClientRect()
        setSource({ x: rect.x, y: rect.y, w: width, h: 10 })
      }
    },
  })

  if (referred === 0) {
    return null
  }

  return (
    <div
      ref={ref}
      className={css({
        borderRadius: '4px',
        background: 'primary',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        px: '8',
        py: '6',
        gap: '6',
        alignSelf: 'stretch',
        '& a': { color: 'text.primary' },
      })}
    >
      <ReactConfetti
        colors={COLORS}
        recycle={false}
        numberOfPieces={400}
        confettiSource={source}
        initialVelocityX={8}
      />
      {/* <div
              className={css({
                fontSize: '36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              })}
            >
              🎉
            </div> */}
      <div>
        <p>
          {referred === 1 && (
            <>
              Herzlichen Dank! Über Ihren persönlichen Link hat jemand ein Abo
              abgeschlossen.
              {hasRegularAbo && (
                <> Zum Dank schenken wir Ihnen einen Monat Republik.</>
              )}
              {hasMonthlyAbo && (
                <>
                  {' '}
                  Zum Dank schreiben wir Ihnen CHF 20 auf einen künftigen
                  Republik-Monat gut.
                </>
              )}
            </>
          )}
          {referred == 2 && (
            <>
              Wahnsinn! Schon <strong>zwei Personen</strong> haben über Ihren
              Link den Weg zur Republik gefunden und ein Abo abgeschlossen.
              Finden Sie noch eine dritte?
            </>
          )}
          {referred > 2 && (
            <>
              Grossartig! <strong>{referred} Personen</strong> haben über Ihren
              Link ein Republik-Abo abgeschlossen. Sie haben offensichtlich
              Talent. <Link href='#TODO'>Teilen Sie Ihre Tipps mit uns!</Link>
              {/*TODO: (Link zum Meta-Beitrag mit
                    Dialog)*/}
            </>
          )}
        </p>
      </div>
    </div>
  )
}
