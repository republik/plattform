import React from 'react'
import {css} from 'glamor'
import {mUp} from '../../theme/mediaQueries'
import {height} from './OverlayToolbar'

const overlayBodyStyle = css({
  padding: `${height + 20}px 12px 20px`,

  [mUp]: {
    padding: `${height + 20}px 20px 20px`,
  }
})

const OverlayBody = props =>
  <div {...overlayBodyStyle} {...props} />

export default OverlayBody