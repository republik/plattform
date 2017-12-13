import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { imageSizeInfo } from 'mdast-react-render/lib/utils'
import { getSrcSizes } from './utils'

const styles = {
  image: css({
    width: '100%'
  }),
  wrappedImage: css({
    position: 'absolute',
    width: '100%'
  }),
  aspectRatio: css({
    backgroundColor: '#eee',
    display: 'block',
    position: 'relative'
  }),
  maxWidth: css({
    display: 'block',
  })
}

class Image extends Component {
  render() {
    const {
      src,
      srcSet,
      alt,
      attributes = {},
      maxWidth,
      size: sizeProp
    } = this.props

    const size = sizeProp || (sizeProp === undefined && imageSizeInfo(src))
    const aspectRatio = size ? size.width / size.height : undefined

    const image = isFinite(aspectRatio)
      ? (
        <span
          {...attributes}
          {...styles.aspectRatio}
          style={{paddingBottom: `${100 / aspectRatio}%`}}>
          <img
            {...styles.wrappedImage}
            src={src}
            srcSet={srcSet}
            alt={alt} />
        </span>
      )
      : <img {...attributes} {...styles.image} src={src} srcSet={srcSet} alt={alt} />

    if (maxWidth) {
      return (
        <span {...styles.maxWidth} style={{maxWidth}}>
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
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }),
  maxWidth: PropTypes.number
}

Image.utils = {
  getSrcSizes: getSrcSizes
}

export default Image
