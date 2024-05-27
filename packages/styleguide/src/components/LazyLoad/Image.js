import React from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'

import LazyLoad from './'

import SwitchImage from '../Figure/SwitchImage'

const styles = {
  img: css({
    display: 'block',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.1)',
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
  onClick,
}) => {
  return (
    <SwitchImage
      {...attributes}
      src={src}
      srcSet={srcSet}
      dark={dark}
      sizes={sizes}
      alt={alt}
      loading={visible ? 'eager' : 'lazy'}
      {...styles.img}
      style={{
        aspectRatio,
        backgroundColor:
          src.match(transparentExtension) ||
          dark?.src.match(transparentExtension)
            ? 'transparent'
            : undefined,
      }}
      onClick={onClick}
    />
  )
}

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  dark: PropTypes.shape({
    src: PropTypes.string.isRequired,
  }),
  srcSet: PropTypes.string,
  sizes: PropTypes.string,
  alt: PropTypes.string,
  aspectRatio: PropTypes.number.isRequired,
  attributes: PropTypes.object,
  visible: PropTypes.bool,
  onClick: PropTypes.func,
}

export default LazyImage
