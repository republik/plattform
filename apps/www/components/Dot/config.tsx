export const TRANSITION = 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)'

export const RADIUS = 9
export const SMALL_RADIUS = 6
export const PADDING_TOP = 100
export const PADDING_LEFT = 0
export const CIRCLE_PADDING = 2
export const COLUMNS = 10
export const SIZE = 2 * RADIUS + CIRCLE_PADDING

export const dataSet = [...Array(100)].map((d, i) => {
  const colIndex = i % COLUMNS
  const rowIndex = Math.floor(i / COLUMNS)
  return {
    cx: colIndex * SIZE + RADIUS,
    cy: rowIndex * SIZE,
    r: RADIUS,
    delay: i * 5,
    id: i,
  }
})

export const COLORS = {
  light: {
    one: '#98d7d5',
    oneBright: '#08dedb',
    two: '#b79ec6',
    twoBright: '#a92bf8',
    three: '#e2ba81',
    threeBright: '#ff9500',
    four: '#b2e2ec',
    fourBright: '#00d5ff',
    default: '#cfcfcf',
    lightBackground: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    one: '#376867',
    oneBright: '#0dcbc8',
    two: '#8b63a4',
    twoBright: '#b743ff',
    three: '#9b794a',
    threeBright: '#fa9e1e',
    four: '#5c8f99',
    fourBright: '#00d5ff',
    default: '#737373',
    lightBackground: 'rgba(255, 255, 255, 0.05)',
  },
}

export const NEW_COLORS = {
  light: {
    one: '#1571B7',
    two: '#DB4C81',
    three: '#72C3C4',
    four: '#887BD3',
    five: '#FFD13C',
    default: '#cfcfcf',
  },
  dark: {
    one: '#1571B7',
    two: '#DB4C81',
    three: '#72C3C4',
    four: '#887BD3',
    five: '#FFD13C',
    default: '#737373',
  },
}

export const bankingData = [
  {
    bank: 'UBS',
    costs: 257575,
    benefit: 104462,
  },
  {
    bank: 'Credit Suisse',
    costs: 178866,
    benefit: -32928,
  },
  {
    bank: 'Zuger Kantonalbank',
    costs: 168291,
    benefit: 181005,
  },
  {
    bank: 'Raiffeisen',
    costs: 143899,
    benefit: 109877,
  },
  {
    bank: 'Kantonalbank Vaudoise',
    costs: 180797,
    benefit: 196169,
  },
]

export const bankingDataWithoutCSLow = [
  {
    bank: 'UBS',
    costs: 257575,
    benefit: 104462,
  },
  {
    bank: 'Credit Suisse',
    costs: 178866,
    benefit: 109877,
  },
  {
    bank: 'Zuger Kantonalbank',
    costs: 163291,
    benefit: 181005,
  },
  {
    bank: 'Raiffeisen',
    costs: 143899,
    benefit: 109877,
  },
  {
    bank: 'Kantonalbank Vaudoise',
    costs: 185797,
    benefit: 196169,
  },
]
