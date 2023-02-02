export const FUTURE_CAMPAIGN_SHARE_IMAGE_URL =
  '/static/5-jahre-republik/republik_jubilaeumslogo_lg-combo-black_share.jpg'

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
  }, //  5 <= Selected < average CHF}
  {
    label: 'Mit dem Schwarm schwimmen',
    text: 'Wie gesagt: Wir wollen nichts Unbedachtes von Ihnen. Wählen Sie den Betrag, der für Sie stimmt. (Im Schnitt zahlen neue Mitstreiter wie Sie CHF 120).',
  }, // average <= selected < 240 CHF}
  {
    label: 'Der Standard',
    text: 'Sie betreten gerade den regulären Bereich! Normalerweise kostet ein Jahr Republik CHF 240. Es freut uns, wenn das für Sie passt.',
  }, // selected = 240 CHF}
  {
    label: 'Die vertrauens\u00ADvolle Investition',
    text: 'Nicht alle, die sich mehr leisten können, tun es auch. Sie schon. Danke für Ihr Vertrauen, Ihren Mut, Ihre Investition in Journalismus.',
  }, // 240 < selected < 500 CHF}
  {
    label: 'Die kühne Investition',
    text: 'Hiermit investieren Sie entschlossen in die Zukunft der Republik. Mögen sich Ihre kühnen Hoffnungen erfüllen!',
  }, // >= 500 CHF}
  {
    label: 'Das Maximum',
    text: 'Respekt – Sie gehen ans Maximum. (Wir werden hart daran arbeiten, Ihnen dorthin zu folgen).',
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

  { step: 1, value: 120, tick: true },

  { step: 1, value: 130 },
  { step: 1, value: 140 },
  { step: 1, value: 150 },
  { step: 1, value: 160 },
  { step: 1, value: 170 },
  { step: 1, value: 180 },
  { step: 1, value: 190 },
  { step: 1, value: 200 },
  { step: 1, value: 210 },
  { step: 1, value: 220 },
  { step: 1, value: 230 },
  { step: 1, value: 230 },

  { step: 2, value: 240, tick: true },

  { step: 3, value: 260 },
  { step: 3, value: 280 },
  { step: 3, value: 300 },
  { step: 3, value: 320 },
  { step: 3, value: 340 },
  { step: 3, value: 360 },
  { step: 3, value: 380 },
  { step: 3, value: 400 },
  { step: 3, value: 420 },
  { step: 3, value: 440 },
  { step: 3, value: 460 },
  { step: 3, value: 480 },

  { step: 4, value: 500, tick: true },

  { step: 4, value: 550 },
  { step: 4, value: 600 },
  { step: 4, value: 650 },
  { step: 4, value: 700 },
  { step: 4, value: 750 },
  { step: 4, value: 800 },
  { step: 4, value: 850 },
  { step: 4, value: 850 },
  { step: 4, value: 900 },
  { step: 4, value: 900 },
  { step: 4, value: 950 },
  { step: 4, value: 950 },

  { step: 5, value: 1000, tick: true },
]
