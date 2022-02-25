import React from 'react'
import { css } from 'glamor'

import { mediaQueries } from '@project-r/styleguide'

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from './constants'

const styles = {
  anchor: css({
    display: 'block',
    visibility: 'hidden',
    position: 'relative',
    top: -(HEADER_HEIGHT_MOBILE + 5),
    [mediaQueries.mUp]: {
      top: -(HEADER_HEIGHT + 5),
    },
  }),
}

const Anchor = ({ id }) => <a {...styles.anchor} id={id} />

export default Anchor
