import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  container: css({
    position: 'relative'
  })
}

export const IMAGE_SIZE = {
  S: 155,
  M: 240,
  L: 325
}

const InfoBox = ({
  children,
  attributes,
  imageSize = 'S',
  float = false,
  ...props
}) => {
  const hasFigure = [...children].some(
    c => c.props.typeName === 'InfoBoxFigure'
  )
  const floatProp = float ? { 'data-image-float': true } : {}

  return (
    <section
      {...attributes}
      {...styles.container}
      data-image-size={hasFigure && imageSize}
      {...floatProp}
    >
      {children}
    </section>
  )
}

InfoBox.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  imageSize: PropTypes.oneOf(['S', 'M', 'L']),
  float: PropTypes.bool
}

export default InfoBox
