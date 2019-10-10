import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  cite: css({
    display: 'block',
    ...sansSerifRegular14,
    marginTop: '18px',
    [mUp]: {
      ...sansSerifRegular15,
      marginTop: '21px'
    },
    fontStyle: 'normal'
  })
}

export const Source = ({ children, attributes }) => {
  return <cite {...styles.cite} {...attributes}>{children}</cite>
}

Source.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Source
