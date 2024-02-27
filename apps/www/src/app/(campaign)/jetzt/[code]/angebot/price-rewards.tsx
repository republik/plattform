'use client'

import { SliderStep } from '@app/app/(campaign)/jetzt/[code]/angebot/price-slider/config'
import { getSliderStepForValue } from '@app/app/(campaign)/jetzt/[code]/angebot/price-slider/helpers'
import { css } from '@app/styled-system/css'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ReactNode } from 'react'

import iconBag from '@app/app/(campaign)/assets/icon-bag-inverted.svg'
import iconCup from '@app/app/(campaign)/assets/icon-cup-inverted.svg'

type Reward = {
  key: SliderStep
  label: string
  text: string
  goodies: ReactNode
}

const Goodie = ({
  iconSrc,
  disabled,
  children,
}: {
  iconSrc?: any
  disabled?: boolean
  children: string
}) => {
  return (
    <div
      className={css({
        fontSize: 'base',
        display: 'flex',
        gap: '4',
        alignItems: 'center',
      })}
    >
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt='Icon'
          className={css({
            width: '3rem',
            height: '3rem',
            flexShrink: 0,
          })}
          loading='eager'
          priority
          style={{ opacity: disabled ? 0.6 : 1 }}
        />
      ) : (
        <div
          className={css({ width: '3rem', height: '3rem', flexShrink: 0 })}
        ></div>
      )}
      <p>{children}</p>
    </div>
  )
}

const SLIDER_STEPS: Record<SliderStep, Reward> = {
  [SliderStep.minimum]: {
    key: SliderStep.minimum,
    label: 'Der minimale Einstieg',
    text: 'Für den Wert von zwei Kaffees pro Monat eine ganze Republik erhalten. Ein Jahr lang. Nicht schlecht!',
    goodies: (
      <Goodie iconSrc={iconBag} disabled>
        Die Republik-Tasche gibts dazu, wenn Sie mehr als CHF 240 bezahlen.
      </Goodie>
    ),
  }, //  5 = Selected
  [SliderStep.belowStandard]: {
    key: SliderStep.belowStandard,
    label: 'Der erleichterte Einstieg',
    text: 'Wählen Sie den Preis, der für Sie passt. Wir freuen uns über jede zusätzliche Unterstützung – und Sie erhalten ein Jahr lang die Republik.',
    goodies: (
      <Goodie iconSrc={iconBag} disabled>
        Die Republik-Tasche gibts dazu, wenn Sie mehr als CHF 240 bezahlen.
      </Goodie>
    ),
  },
  [SliderStep.standard]: {
    key: SliderStep.standard,
    label: 'Der souveräne Einstieg',
    text: 'So viel bezahlt die grosse Mehrheit unserer Unterstützer. Wir werden Ihnen in den kommenden 12 Monaten beweisen, dass sich jeder Franken gelohnt hat.',
    goodies: (
      <>
        <Goodie iconSrc={iconBag}>
          Zum Dank schenken wir Ihnen beim Abo-Kauf eine Republik-Tasche!
        </Goodie>
        <Goodie>
          Sie werden zudem Mitglied der Project R Genossenschaft, die hinter der
          Republik steht. Als Mitglied haben Sie keine Verpflichtungen, können
          aber bei ausgewählten Fragen mitentscheiden.
        </Goodie>
      </>
    ),
  }, // selected = 240 CHF}
  [SliderStep.investmentLow]: {
    key: SliderStep.investmentLow,
    label: 'Der grosszügige Einstieg',
    text: 'Sie können sich mehr als den Normalpreis leisten und tun dies auch. Wir bedanken uns für Ihre Grosszügigkeit!',
    goodies: (
      <>
        <Goodie iconSrc={iconBag}>
          Zum Dank schenken wir Ihnen beim Abo-Kauf eine Republik-Tasche!
        </Goodie>
        <Goodie>
          Sie werden zudem Mitglied der Project R Genossenschaft, die hinter der
          Republik steht. Als Mitglied haben Sie keine Verpflichtungen, können
          aber bei ausgewählten Fragen mitentscheiden.
        </Goodie>
      </>
    ),
  },
  [SliderStep.maximum]: {
    key: SliderStep.maximum,
    label: 'Der fulminante Einstieg',
    text: 'Was für ein Start! Mit Ihrer Unterstützung erhalten wir längerfristig Sicherheit. Ihr Vertrauen ehrt uns.',
    goodies: (
      <>
        <Goodie iconSrc={iconBag}>
          Zum Dank schenken wir Ihnen beim Abo-Kauf eine Republik-Tasche!
        </Goodie>
        <Goodie iconSrc={iconCup}>
          Und wir laden Sie zu einem persönlichen Besuch bei uns ins Rothaus ein
          und zeigen Ihnen bei Kaffee und Kuchen die Redaktion.
        </Goodie>
        <Goodie>
          Sie werden zudem Mitglied der Project R Genossenschaft, die hinter der
          Republik steht. Als Mitglied haben Sie keine Verpflichtungen, können
          aber bei ausgewählten Fragen mitentscheiden.
        </Goodie>
      </>
    ),
  },
} as const

export const PriceRewards = () => {
  const searchParams = useSearchParams()

  const stepKey = getSliderStepForValue(+searchParams.get('price')).step

  const step = SLIDER_STEPS[stepKey]

  return (
    <>
      <h1
        className={css({
          textStyle: 'campaignHeading',
        })}
      >
        {step.label}
      </h1>
      <p>{step.text}</p>
      {step.goodies}
    </>
  )
}
