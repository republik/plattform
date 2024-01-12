export type SliderStepKey =
  | 'belowStandard'
  | 'average'
  | 'aboveAverage'
  | 'standard'
  | 'investmentLow'
  | 'investmentHigh'
  | 'maximum'

type SliderStep = {
  key: SliderStepKey
  iconSrc: string
  label: string
  text: string
  goodie: boolean
  goodieText: string
  bonusHint: string
}

export type SliderValue = {
  position: number
  step: SliderStep
  value: number
  tick?: boolean
  isDefault?: boolean
  isAverage?: boolean
}

const SLIDER_STEPS: Record<SliderStepKey, SliderStep> = {
  belowStandard: {
    key: 'belowStandard',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-0.svg',
    label: 'Dabei sein ist alles',
    text: 'Sollten Sie aktuell knapp bei Kasse sein: Das kann jeder Lady und jedem Gentleman passieren. Willkommen an Bord!',
    goodie: false,
    goodieText:
      'Die Jubiläumstasche gibts dazu, wenn Sie mehr als den Durchschnitt bezahlen.',
    bonusHint: '',
  }, //  5 <= Selected < average CHF}
  average: {
    key: 'average',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-1.svg',
    label: 'Mit dem Schwarm schwimmen',
    text: 'Wählen Sie den Betrag, der für Sie stimmt. Mitglieder, die ihren Preis selber wählen, zahlen im Schnitt so viel.',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint: '',
  }, // average <= selected < 240 CHF}
  aboveAverage: {
    key: 'aboveAverage',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-2.svg',
    label: 'Über dem Durchschnitt',
    text: 'Sie gehen Ihren eigenen Weg, aber es ist kein Alleingang. Schön, sind Sie dabei!',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint: '',
  }, // average <= selected < 240 CHF}
  standard: {
    key: 'standard',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-3.svg',
    label: 'Der zuverlässige Standard',
    text: 'Sie befinden sich im regulären Bereich und zahlen unseren Normalpreis. Es freut uns, wenn das für Sie passt!',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 240 werden Sie Mitglied der Project R Genossenschaft.',
  }, // selected = 240 CHF}
  investmentLow: {
    key: 'investmentLow',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-4.svg',
    label: 'Die vertrauens\u00ADvolle Investition',
    text: 'Nicht alle, die sich mehr leisten können, tun es auch. Sie schon. Danke für Ihr Vertrauen, Ihren Mut, Ihre Investition in Journalismus.',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 240 werden Sie Mitglied der Project R Genossenschaft.',
  }, // 240 < selected < 500 CHF}
  investmentHigh: {
    key: 'investmentHigh',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-5.svg',
    label: 'Die kühne Investition',
    text: 'Hiermit investieren Sie entschlossen in die Zukunft der Republik. Mögen sich Ihre kühnen Hoffnungen erfüllen!',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 240 werden Sie Mitglied der Project R Genossenschaft.',
  }, // >= 500 CHF}
  maximum: {
    key: 'maximum',
    iconSrc: '/static/5-jahre-republik/receiver/slider-step-6.svg',
    label: 'Das Maximum',
    text: 'Respekt – Sie geben alles. (Und wir arbeiten hart daran, es Ihnen gleichzutun.)',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 1000 werden Sie Gönnerin und Mitglied der Project R Genossenschaft.',
  }, // selected = 1000 CHF}
} as const

export const SLIDER_VALUES: SliderValue[] = [
  { step: SLIDER_STEPS.belowStandard, value: 5, tick: true },

  { step: SLIDER_STEPS.belowStandard, value: 10 },
  { step: SLIDER_STEPS.belowStandard, value: 20 },
  { step: SLIDER_STEPS.belowStandard, value: 30 },
  { step: SLIDER_STEPS.belowStandard, value: 40 },
  { step: SLIDER_STEPS.belowStandard, value: 50 },
  { step: SLIDER_STEPS.belowStandard, value: 60 },
  { step: SLIDER_STEPS.belowStandard, value: 70 },
  { step: SLIDER_STEPS.belowStandard, value: 80 },
  { step: SLIDER_STEPS.belowStandard, value: 90 },
  { step: SLIDER_STEPS.belowStandard, value: 100 },
  { step: SLIDER_STEPS.belowStandard, value: 110 },
  { step: SLIDER_STEPS.belowStandard, value: 110 },

  { step: SLIDER_STEPS.average, value: 120, tick: true, isAverage: true },

  { step: SLIDER_STEPS.aboveAverage, value: 130 },
  { step: SLIDER_STEPS.aboveAverage, value: 140 },
  { step: SLIDER_STEPS.aboveAverage, value: 150 },
  { step: SLIDER_STEPS.aboveAverage, value: 160 },
  { step: SLIDER_STEPS.aboveAverage, value: 170 },
  { step: SLIDER_STEPS.aboveAverage, value: 180 },
  { step: SLIDER_STEPS.aboveAverage, value: 190 },
  { step: SLIDER_STEPS.aboveAverage, value: 200 },
  { step: SLIDER_STEPS.aboveAverage, value: 210 },
  { step: SLIDER_STEPS.aboveAverage, value: 220 },
  { step: SLIDER_STEPS.aboveAverage, value: 230 },
  { step: SLIDER_STEPS.aboveAverage, value: 230 },

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
  { step: SLIDER_STEPS.investmentLow, value: 480 },

  { step: SLIDER_STEPS.investmentHigh, value: 500, tick: true },

  { step: SLIDER_STEPS.investmentHigh, value: 550 },
  { step: SLIDER_STEPS.investmentHigh, value: 600 },
  { step: SLIDER_STEPS.investmentHigh, value: 650 },
  { step: SLIDER_STEPS.investmentHigh, value: 700 },
  { step: SLIDER_STEPS.investmentHigh, value: 750 },
  { step: SLIDER_STEPS.investmentHigh, value: 800 },
  { step: SLIDER_STEPS.investmentHigh, value: 850 },
  { step: SLIDER_STEPS.investmentHigh, value: 850 },
  { step: SLIDER_STEPS.investmentHigh, value: 900 },
  { step: SLIDER_STEPS.investmentHigh, value: 900 },
  { step: SLIDER_STEPS.investmentHigh, value: 950 },
  { step: SLIDER_STEPS.investmentHigh, value: 950 },

  { step: SLIDER_STEPS.maximum, value: 1000, tick: true },
].map((value, position) => {
  return { position, ...value }
})

export const SLIDER_TRANSITION = {
  type: 'spring',
  bounce: 0.3,
  duration: 0.3,
}
