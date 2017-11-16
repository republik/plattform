import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { BREAKOUT_SIZE, Breakout } from '../Center'

const styles = {
  container: css({
    position: 'relative'
  })
}

export const IMAGE_SIZE = {
  XS: 120,
  S: 155,
  M: 240,
  L: 325
}

const getBreakoutSize = (size, hasFigure) => {
  if (size === 'float') {
    return hasFigure ? BREAKOUT_SIZE.floatSmall : BREAKOUT_SIZE.floatTiny
  }
  if (size === 'breakout') {
    return BREAKOUT_SIZE.breakoutLeft
  }
  return size
}

const InfoBox = ({ children, attributes, size, imageSize, imageFloat }) => {
  const hasFigure = [...children].some(
    c => c.props.typeName === 'InfoBoxFigure'
  )
  const imageFloatProp =
    imageFloat || (hasFigure && size === 'float')
      ? { 'data-image-float': true }
      : {}
  const computedImageSize = hasFigure
    ? size === 'float' ? 'XS' : imageSize
    : null

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, hasFigure)}>
      <section
        {...styles.container}
        data-image-size={computedImageSize}
        {...imageFloatProp}
      >
        {children}
      </section>
    </Breakout>
  )
}

InfoBox.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(['regular', 'float', 'breakout']).isRequired,
  imageSize: PropTypes.oneOf(['XS', 'S', 'M', 'L']).isRequired,
  imageFloat: PropTypes.bool.isRequired
}

InfoBox.defaultProps = {
  size: 'regular',
  imageSize: 'S',
  imageFloat: false
}

export default InfoBox
