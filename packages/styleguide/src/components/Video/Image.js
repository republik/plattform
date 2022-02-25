import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  image: css({
    width: '100%',
  }),
  aspectRatio: css({
    backgroundColor: 'rgba(0,0,0,0.1)',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    display: 'block',
    position: 'relative',
  }),
  maxWidth: css({
    display: 'block',
  }),
}

class Image extends Component {
  render() {
    const {
      src,
      srcSet,
      alt,
      attributes = {},
      maxWidth,
      aspectRatio,
    } = this.props

    const image = isFinite(aspectRatio) ? (
      <span
        {...attributes}
        {...styles.aspectRatio}
        style={{
          paddingBottom: `${100 / aspectRatio}%`,
          backgroundImage: `url(${src})`,
        }}
        role='img'
        aria-label={alt}
      ></span>
    ) : (
      <img
        {...attributes}
        {...styles.image}
        src={src}
        srcSet={srcSet}
        alt={alt}
      />
    )

    if (maxWidth) {
      return (
        <span {...styles.maxWidth} style={{ maxWidth }}>
          {image}
        </span>
      )
    }
    return image
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  srcSet: PropTypes.string,
  alt: PropTypes.string,
  maxWidth: PropTypes.number,
  aspectRatio: PropTypes.number,
}

export default Image
