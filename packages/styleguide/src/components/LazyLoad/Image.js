import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'

import LazyLoad from './'

import SwitchImage from '../Figure/SwitchImage'

const styles = {
  container: css({
    display: 'block',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.1)',
  }),
  img: css({
    position: 'absolute',
    width: '100%',
  }),
}

const transparentExtension = /\.(png|gif|svg)(\.webp)?(\?|$)/

const LazyImage = ({
  src,
  dark,
  srcSet,
  sizes,
  alt,
  aspectRatio,
  attributes,
  visible,
  offset,
  onClick,
}) => (
  <LazyLoad
    attributes={{ ...styles.container, ...attributes }}
    offset={offset}
    visible={visible}
    consistentPlaceholder
    type='span'
    style={{
      // We always subtract 1px to prevent against rounding issues that can lead
      // to the background color shining through at the bottom of the image.
      paddingBottom: `calc(${100 / aspectRatio}% - 1px)`,
      backgroundColor:
        src.match(transparentExtension) || dark?.src.match(transparentExtension)
          ? 'transparent'
          : undefined,
    }}
  >
    <SwitchImage
      src={src}
      srcSet={srcSet}
      dark={dark}
      sizes={sizes}
      alt={alt}
      {...styles.img}
      onClick={onClick}
    />
  </LazyLoad>
)

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  dark: PropTypes.shape({
    src: PropTypes.string.isRequired,
  }),
}

export default LazyImage
