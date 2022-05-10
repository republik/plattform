import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { height } from './OverlayToolbar'

const PADDING = 20

const overlayBodyStyle = css({
  padding: `${height + PADDING}px ${PADDING}px`,
  // The iPhone X Space
  // - thank you Apple for overlaying websites
  paddingBottom: 120,
  [mUp]: {
    padding: `${height + PADDING}px ${PADDING}px`,
    paddingBottom: PADDING,
  },
})

const OverlayBody = (props) => <div {...overlayBodyStyle} {...props} />

OverlayBody.PADDING = PADDING

export default OverlayBody
