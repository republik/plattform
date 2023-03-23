export const TRANSITION = 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)'

export const RADIUS = 9
export const SMALL_RADIUS = 6
export const PADDING_TOP = 250
export const PADDING_LEFT = 0
export const CIRCLE_PADDING = 3
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
