// Herbst-26 special (21.09.–04.10.2026): articles are open to everyone, we only
// show a paynote. Delete this module and its call sites afterwards.

export const HERBST26_PROMO_CODE = 'herbst26'

export const HERBST26_HEADLINE =
  'Nur bis zum 4. Oktober 2026: ein Jahr lang Republik lesen für 160 statt 240 Franken.'
export const HERBST26_MINI_NOTE =
  'Nur für kurze Zeit: ein Jahr Republik für 160.– statt 240.–'

// HERBST26_END is the start of 05.10, so 04.10 is included.
export const HERBST26_BEGIN = new Date('2026-09-21T00:00:00+02:00')
export const HERBST26_END = new Date('2026-10-05T00:00:00+02:00')

export const isHerbst26Active = (now: Date = new Date()) =>
  now >= HERBST26_BEGIN && now < HERBST26_END
