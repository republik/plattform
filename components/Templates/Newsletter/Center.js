import React from 'react'
import { css } from 'glamor'

const PADDING = 20
const containerStyle = css({
  margin: '0 auto',
  padding: PADDING,
  paddingTop: PADDING / 2,
  maxWidth: 640,
  '@media (min-width: 600px)': {
    paddingTop: PADDING
  }
})

export default ({children}) => (
  <div {...containerStyle}>
    {children}
    <div style={{clear: 'both'}} />
  </div>
)
