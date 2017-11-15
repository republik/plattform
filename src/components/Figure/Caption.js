import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  caption: css({
    ...sansSerifRegular14,
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
