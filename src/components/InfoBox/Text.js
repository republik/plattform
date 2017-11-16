import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { IMAGE_SIZE } from './InfoBox'

const styles = {
  text: css({
    ...sansSerifRegular15,
    [mUp]: {
      ...sansSerifRegular18
    },
    color: colors.text,
    ':not([data-image-float])[data-image-size="XS"] > &': {
      [mUp]: {
        marginLeft: `${IMAGE_SIZE['XS'] + 20}px`
      }
    },
    ':not([data-image-float])[data-image-size="S"] > &': {
      [mUp]: {
        marginLeft: `${IMAGE_SIZE['S'] + 20}px`
      }
    },
    ':not([data-image-float])[data-image-size="M"] > &': {
      [mUp]: {
        marginLeft: `${IMAGE_SIZE['M'] + 20}px`
      }
    },
    ':not([data-image-float])[data-image-size="L"] > &': {
      [mUp]: {
        marginLeft: `${IMAGE_SIZE['L'] + 20}px`
      }
    }
  })
}

export const Text = ({ children, attributes }) => {
  return (
    <p {...attributes} {...styles.text}>
      {children}
    </p>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Text
