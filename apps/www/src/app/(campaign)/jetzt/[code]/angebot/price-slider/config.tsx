import { ReactNode } from 'react'

export type SliderStepKey =
  | 'minimum'
  | 'belowStandard'
  // | 'average'
  // | 'aboveAverage'
  | 'standard'
  | 'investmentLow'
  // | 'investmentHigh'
  | 'maximum'

type SliderStep = {
  key: SliderStepKey
  iconSrc: string
  label: string
  text: string
  goodie: boolean
  goodieText: ReactNode
  bonusHint: string
}

export type SliderValue = {
  position: number
  step: SliderStep
  value: number
  tick?: boolean
  isDefault?: boolean
}

const SLIDER_STEPS: Record<SliderStepKey, SliderStep> = {
  minimum: {
    key: 'minimum',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-0.svg',
    label: 'Der minimale Einstieg',
    text: 'Jeden Monat für den Wert von zwei Kaffees eine ganze Republik erhalten. Nicht schlecht!',
    goodie: false,
    goodieText:
      'Die Jubiläumstasche gibts dazu, wenn Sie mehr als CHF 240 bezahlen.',
    bonusHint: '',
  }, //  5 = Selected
  belowStandard: {
    key: 'belowStandard',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-0.svg',
    label: 'Der erleichterte Einstieg',
    text: 'Wählen Sie den Preis, der für Sie passt. Wir freuen uns über jede zusätzliche Unterstützung!',
    goodie: false,
    goodieText:
      'Die Jubiläumstasche gibts dazu, wenn Sie mehr als CHF 240 bezahlen.',
    bonusHint: '',
  }, //  5 <= Selected < average CHF}
  // average: {
  //   key: 'average',
  //   iconSrc: '/static/5-jahre-republik/receiver/slider-step-1.svg',
  //   label: 'Mit dem Schwarm schwimmen',
  //   text: 'Wer sich den Normalpreis nicht leisten kann, zahlt in der Regel die Hälfte. Sie auch?',
  //   goodie: false,
  //   goodieText:
  //     'Die Jubiläumstasche gibts dazu, wenn Sie mehr als CHF 240 bezahlen.',
  //   bonusHint: '',
  // }, // average <= selected < 240 CHF}
  // aboveAverage: {
  //   key: 'aboveAverage',
  //   iconSrc: '/static/5-jahre-republik/receiver/slider-step-2.svg',
  //   label: 'Mehr als die Hälfte',
  //   text: 'Sie gehen Ihren eigenen Weg, aber es ist kein Alleingang. Schön, sind Sie dabei!',
  //   goodie: true,
  //   goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
  //   bonusHint: '',
  // }, // average <= selected < 240 CHF}
  standard: {
    key: 'standard',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-3.svg',
    label: 'Der souveräne Einstieg',
    text: 'So viel bezahlt die grosse Mehrheit unserer Unterstützer. Wir werden Ihnen in den kommenden 12 Monaten beweisen, dass sich jeder Franken gelohnt hat.',
    goodie: true,
    goodieText:
      'Zum Dank schenken wir Ihnen beim Abo-Kauf eine Republik-Tasche!',
    bonusHint:
      'Sie werden zudem Mitglied der Project R Genossenschaft, die hinter der Republik steht. Als Mitglied haben Sie keine Verpflichtungen, können aber bei ausgewählten Fragen mitentscheiden.',
  }, // selected = 240 CHF}
  investmentLow: {
    key: 'investmentLow',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-4.svg',
    label: 'Der grosszügige Einstieg',
    text: 'Sie können sich mehr als den Normalpreis leisten und tun dies auch. Wir bedanken uns für Ihre Grosszügigkeit!',
    goodie: true,
    goodieText:
      'Zum Dank schenken wir Ihnen beim Abo-Kauf eine Republik-Tasche!',
    bonusHint:
      'Sie werden zudem Mitglied der Project R Genossenschaft, die hinter der Republik steht. Als Mitglied haben Sie keine Verpflichtungen, können aber bei ausgewählten Fragen mitentscheiden.',
  }, // 240 < selected < 500 CHF}
  // investmentHigh: {
  //   key: 'investmentHigh',
  //   iconSrc: '/static/5-jahre-republik/receiver/slider-step-5.svg',
  //   label: 'Die kühne Investition',
  //   text: 'Hiermit investieren Sie entschlossen in die Zukunft der Republik. Mögen sich Ihre kühnen Hoffnungen erfüllen!',
  //   goodie: true,
  //   goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
  //   bonusHint:
  //     'Sie werden zudem Mitglied der Project R Genossenschaft',
  // }, // >= 500 CHF}
  maximum: {
    key: 'maximum',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-6.svg',
    label: 'Der fulminante Einstieg',
    text: 'Was für ein Start! Mit Ihrer Unterstützung erhalten wir längerfristig Sicherheit. Ihr Vertrauen ehrt uns.',
    goodie: true,
    goodieText: (
      <>
        Zum Dank schenken wir Ihnen beim Abo-Kauf eine Republik-Tasche!
        <br />
        Und wir laden Sie zu einem persönlichen Besuch bei uns ins Rothaus ein
        und zeigen Ihnen bei Kaffee und Kuchen die Redaktion.
      </>
    ),
    bonusHint:
      'Sie werden zudem Mitglied der Project R Genossenschaft, die hinter der Republik steht. Als Mitglied haben Sie keine Verpflichtungen, können aber bei ausgewählten Fragen mitentscheiden.',
  }, // selected = 1000 CHF}
} as const

export const SLIDER_VALUE_MINIMUM = 120
export const SLIDER_VALUE_AVERAGE = 240

export const SLIDER_VALUES: SliderValue[] = [
  { step: SLIDER_STEPS.minimum, value: SLIDER_VALUE_MINIMUM, tick: true },

  { step: SLIDER_STEPS.belowStandard, value: 130 },
  { step: SLIDER_STEPS.belowStandard, value: 140 },
  { step: SLIDER_STEPS.belowStandard, value: 150 },
  { step: SLIDER_STEPS.belowStandard, value: 160 },
  { step: SLIDER_STEPS.belowStandard, value: 170 },
  { step: SLIDER_STEPS.belowStandard, value: 180 },
  { step: SLIDER_STEPS.belowStandard, value: 190 },
  { step: SLIDER_STEPS.belowStandard, value: 200 },
  { step: SLIDER_STEPS.belowStandard, value: 210 },
  { step: SLIDER_STEPS.belowStandard, value: 220 },
  { step: SLIDER_STEPS.belowStandard, value: 230 },

  { step: SLIDER_STEPS.standard, value: 240, tick: true, isDefault: true },

  { step: SLIDER_STEPS.investmentLow, value: 260 },
  { step: SLIDER_STEPS.investmentLow, value: 280 },
  { step: SLIDER_STEPS.investmentLow, value: 300 },
  { step: SLIDER_STEPS.investmentLow, value: 320 },
  { step: SLIDER_STEPS.investmentLow, value: 340 },
  { step: SLIDER_STEPS.investmentLow, value: 360 },
  { step: SLIDER_STEPS.investmentLow, value: 380 },
  { step: SLIDER_STEPS.investmentLow, value: 400 },
  { step: SLIDER_STEPS.investmentLow, value: 420 },
  { step: SLIDER_STEPS.investmentLow, value: 440 },
  { step: SLIDER_STEPS.investmentLow, value: 460 },

  { step: SLIDER_STEPS.maximum, value: 480, tick: true },
].map((value, position) => {
  return { position, ...value }
})

export const SLIDER_TRANSITION = {
  type: 'spring',
  bounce: 0.4,
  duration: 0.5,
}
