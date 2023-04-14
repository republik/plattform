export const TRANSITION = 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)'

export const RADIUS = 9
export const SMALL_RADIUS = 2
export const PADDING_TOP = 150
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
    id: i,
  }
})

export const COLORS = {
  light: {
    one: '#98d7d5',
    oneBright: '#08dedb',
    one100: '#ffe283',
    one200: '#fbbe29',
    one300: '#f28b02',
    one400: '#cd570c',
    one500: '#ad3e14',
    two100: '#9fdddf',
    two200: '#4cbec2',
    two300: '#199a9f',
    two400: '#126f73',
    two500: '#0e5658',
    three100: '#ebb0dd',
    three200: '#d674c0',
    three300: '#bc399f',
    three400: '#932c7b',
    three500: '#792465',
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
    lightBackground: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    one: '#1571B7',
    two: '#DB4C81',
    three: '#72C3C4',
    four: '#887BD3',
    five: '#FFD13C',
    default: '#737373',
    lightBackground: 'rgba(255, 255, 255, 0.05)',
  },
}

export const bankingLabelData = [
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

export const bankingPositionData = [
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

export const creditSuiseHistoricalData = [
  {
    year: '2020',
    costs: 202789,
    benefit: 54726,
  },
  {
    year: '2019',
    costs: 209695,
    benefit: 71438,
  },
  {
    year: '2018',
    costs: 210595,
    benefit: 44308,
  },
  {
    year: '2017',
    costs: 221328,
    benefit: -20986,
  },
  {
    year: '2016',
    costs: 225821,
    benefit: 57452,
  },
  {
    year: '2015',
    costs: 239544,
    benefit: -61079,
  },
  {
    year: '2014',
    costs: 247467,
    benefit: 40939,
  },
  {
    year: '2013',
    costs: 244696,
    benefit: 50565,
  },
  {
    year: '2012',
    costs: 264346,
    benefit: 29409,
  },
  {
    year: '2011',
    costs: 265855,
    benefit: 39296,
  },
  {
    year: '2010',
    costs: 291397,
    benefit: 101756,
  },
]
