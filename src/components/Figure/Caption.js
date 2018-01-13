import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular12, sansSerifRegular15 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { PADDING } from '../Center'

const styles = {
  caption: css({
    margin: '0 auto',
    width: '100%',
    maxWidth: `calc(100vw - ${PADDING * 2}px)`,
    ...sansSerifRegular12,
    [mUp]: {
      ...sansSerifRegular15,
      lineHeight: '18px'
    }
  })
}

export const Caption = ({ children, attributes }) => {
  return (
    <figcaption {...attributes} {...styles.caption}>
      {children}
    </figcaption>
  )
}

Caption.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Caption
