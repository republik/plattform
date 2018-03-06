import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, tUp } from './mediaQueries'
import { FigureImage, FigureByline } from '../Figure'
import Text from './Text'

const styles = {
  container: css({
    position: 'relative',
    lineHeight: 0,
    margin: 0,
    [tUp]: {
      background: 'none'
    }
  }),
  textContainer: css({
    padding: '15px 15px 30px 15px',
    [mUp]: {
      padding: '40px 15% 70px 15%'
    },
    [tUp]: {
      padding: 0
    }
  })
}

const ImageBlock = ({
  children,
  attributes,
  image,
  byline,
  alt,
  onClick,
  color,
  bgColor,
  textPosition,
  center,
  aboveTheFold,
  onlyImage
}) => {
  const background = bgColor || ''
  return (
    <div {...attributes} {...styles.container} onClick={onClick} style={{
      background,
      cursor: onClick ? 'pointer' : 'default'
    }}>
      <div style={{position: 'relative', fontSize: 0}}>
        <FigureImage aboveTheFold={aboveTheFold} {...FigureImage.utils.getResizedSrcs(image, 1500, false)} alt={alt} />
        {byline && <FigureByline position={onlyImage ? 'leftInsideOnlyImage' : 'leftInside'} style={{color}}>
          {byline}
        </FigureByline>}
      </div>
      {!onlyImage && <div {...styles.textContainer}>
        <Text position={textPosition} color={color} center={center}>
          {children}
        </Text>
      </div>}
    </div>
  )
}

ImageBlock.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  image: PropTypes.string.isRequired,
  byline: PropTypes.string,
  alt: PropTypes.string,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  center: PropTypes.bool,
  textPosition: PropTypes.oneOf([
    'topleft',
    'topright',
    'bottomleft',
    'bottomright',
    'top',
    'middle',
    'bottom'
  ]),
  onlyImage: PropTypes.bool
}

ImageBlock.defaultProps = {
  textPosition: 'topleft',
  alt: '',
  onlyImage: false
}

export default ImageBlock
