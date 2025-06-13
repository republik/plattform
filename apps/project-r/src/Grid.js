import React from 'react'
import { css } from 'glamor'

const PADDING = 10
const mqMedium = '@media (min-width: 600px)'

const gridStyle = css({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  margin: `0 -${PADDING}px`,
})
const Grid = ({ children }) => <div {...gridStyle}>{children}</div>
export default Grid

const gridItemStyle = css({
  paddingLeft: PADDING,
  paddingRight: PADDING,
  width: '100%',
  [mqMedium]: {
    width: '50%',
  },
})
export const GridItem = ({ children, paddingBottom = PADDING * 2 }) => (
  <div {...gridItemStyle} style={{ paddingBottom }}>
    {children}
  </div>
)
