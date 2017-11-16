import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium16, sansSerifMedium19 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { IMAGE_SIZE } from './InfoBox'

const styles = {
  text: css({
    marginTop: 0,
    borderTop: `1px solid ${colors.text}`,
    ...sansSerifMedium16,
    [mUp]: {
      ...sansSerifMedium19
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

export const Title = ({ children, attributes }) => {
  return (
    <p {...attributes} {...styles.text}>
      {children}
    </p>
  )
}

Title.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Title
