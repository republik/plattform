import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'

export const FUTURE_CAMPAIGN_SHARE_IMAGE_URL =
  CDN_FRONTEND_BASE_URL + '/static/5-jahre-republik/receiver/share.png'

// Slider constants

export const SLIDER_TRANSITION = {
  type: 'spring',
  bounce: 0.3,
  duration: 0.3,
}

// TODO: Use translation keys here
export const SLIDER_STEPS = [
  {
    label: 'Dabei sein ist alles',
    text: 'Sollten Sie aktuell knapp bei Kasse sein: Das kann jeder Lady und jedem Gentleman passieren. Willkommen an Bord!',
    goodie: false,
    goodieText:
      'Die Jubiläumstasche gibts dazu, wenn Sie mehr als den Durchschnitt bezahlen.',
    bonusHint: '',
  }, //  5 <= Selected < average CHF}
  {
    label: 'Mit dem Schwarm schwimmen',
    text: 'Wählen Sie den Betrag, der für Sie stimmt. Mitstreiter, die ihren Preis selber wählen, zahlen im Schnitt 120 CHF',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint: '',
  }, // average <= selected < 240 CHF}
  {
    label: 'Über dem Durchschnitt',
    text: 'Sie gehen Ihren eigenen Weg, aber es ist kein Alleingang. Schön, sind Sie dabei!',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint: '',
  }, // average <= selected < 240 CHF}
  {
    label: 'Der zuverlässige Standard',
    text: 'Sie befinden sich im regulären Bereich und zahlen unseren Normalpreis. Es freut uns, wenn das für Sie passt!',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 240 werden Sie Mitglied der Project R Genossenschaft.',
  }, // selected = 240 CHF}
  {
    label: 'Die vertrauens\u00ADvolle Investition',
    text: 'Nicht alle, die sich mehr leisten können, tun es auch. Sie schon. Danke für Ihr Vertrauen, Ihren Mut, Ihre Investition in Journalismus.',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 240 werden Sie Mitglied der Project R Genossenschaft.',
  }, // 240 < selected < 500 CHF}
  {
    label: 'Die kühne Investition',
    text: 'Hiermit investieren Sie entschlossen in die Zukunft der Republik. Mögen sich Ihre kühnen Hoffnungen erfüllen!',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 240 werden Sie Mitglied der Project R Genossenschaft.',
  }, // >= 500 CHF}
  {
    label: 'Das Maximum',
    text: 'Respekt – Sie geben alles. (Und wir arbeiten hart daran, es Ihnen gleichzutun.)',
    goodie: true,
    goodieText: 'Zum Abo-Kauf schenken wir Ihnen eine Jubiläumstasche dazu.',
    bonusHint:
      'Hinweis: Ab einem Preis von CHF 240 werden Sie Mitglied der Project R Genossenschaft.',
  }, // selected = 1000 CHF}
]

export const SLIDER_STEP_VALUES = [
  { step: 0, value: 5, tick: true },

  { step: 0, value: 10 },
  { step: 0, value: 20 },
  { step: 0, value: 30 },
  { step: 0, value: 40 },
  { step: 0, value: 50 },
  { step: 0, value: 60 },
  { step: 0, value: 70 },
  { step: 0, value: 80 },
  { step: 0, value: 90 },
  { step: 0, value: 100 },
  { step: 0, value: 110 },
  { step: 0, value: 110 },

  { step: 1, value: 120, tick: true, isDefault: true },

  { step: 2, value: 130 },
  { step: 2, value: 140 },
  { step: 2, value: 150 },
  { step: 2, value: 160 },
  { step: 2, value: 170 },
  { step: 2, value: 180 },
  { step: 2, value: 190 },
  { step: 2, value: 200 },
  { step: 2, value: 210 },
  { step: 2, value: 220 },
  { step: 2, value: 230 },
  { step: 2, value: 230 },

  { step: 3, value: 240, tick: true },

  { step: 4, value: 260 },
  { step: 4, value: 280 },
  { step: 4, value: 300 },
  { step: 4, value: 320 },
  { step: 4, value: 340 },
  { step: 4, value: 360 },
  { step: 4, value: 380 },
  { step: 4, value: 400 },
  { step: 4, value: 420 },
  { step: 4, value: 440 },
  { step: 4, value: 460 },
  { step: 4, value: 480 },

  { step: 5, value: 500, tick: true },

  { step: 5, value: 550 },
  { step: 5, value: 600 },
  { step: 5, value: 650 },
  { step: 5, value: 700 },
  { step: 5, value: 750 },
  { step: 5, value: 800 },
  { step: 5, value: 850 },
  { step: 5, value: 850 },
  { step: 5, value: 900 },
  { step: 5, value: 900 },
  { step: 5, value: 950 },
  { step: 5, value: 950 },

  { step: 6, value: 1000, tick: true },
]
