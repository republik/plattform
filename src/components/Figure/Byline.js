import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular10, sansSerifRegular12 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  byline: css({
    ...sansSerifRegular10,
    [mUp]: {
      ...sansSerifRegular12
    }
  })
}

export const Byline = ({ children, attributes }) => {
  return (
    <span {...attributes} {...styles.byline}>
      {children}
    </span>
  )
}

Byline.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Byline
