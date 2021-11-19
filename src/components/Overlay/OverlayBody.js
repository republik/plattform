import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { height } from './OverlayToolbar'

const overlayBodyStyle = css({
  padding: `${height + 20}px 20px`,
  // The iPhone X Space
  // - thank you Apple for overlaying websites
  paddingBottom: 120,
  [mUp]: {
    padding: `${height + 20}px 20px`,
    paddingBottom: 20
  }
})

const OverlayBody = ({ noPadding = false, ...rest }) => (
  <div {...(!noPadding && overlayBodyStyle)} {...rest} />
)

export default OverlayBody
