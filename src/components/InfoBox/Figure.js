import React from 'react'
import PropTypes from 'prop-types'
import { Figure } from '../Figure'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { IMAGE_SIZE } from './InfoBox'

const imageContainerStyles = {
  floated: {
    float: 'left',
    margin: '10px 15px 5px 0',
    width: '99px'
  },
  absolute: {
    ':not([data-image-float]) > &': {
      position: 'absolute',
      left: 0,
      margin: '0 15px 15px 0',
      top: 0
    }
  }
}

const sizeStyles = {
  '[data-image-size="S"] > &': {
    [mUp]: {
      width: `${IMAGE_SIZE['S']}px`
    }
  },
  '[data-image-size="M"] > &': {
    [mUp]: {
      width: `${IMAGE_SIZE['M']}px`
    }
  },
  '[data-image-size="L"] > &': {
    [mUp]: {
      width: `${IMAGE_SIZE['L']}px`
    }
  }
}

const styles = {
  imageContainer: css({
    ...imageContainerStyles.floated,
    ...sizeStyles,
    [mUp]: {
      ...imageContainerStyles.absolute
    }
  })
}

const InfoBoxFigure = ({ children, attributes }) => {
  return (
    <div {...attributes} {...styles.imageContainer}>
      <Figure>{children}</Figure>
    </div>
  )
}

InfoBoxFigure.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  typeName: PropTypes.string
}

InfoBoxFigure.defaultProps = {
  typeName: 'InfoBoxFigure'
}

export default InfoBoxFigure
