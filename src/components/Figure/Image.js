import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { imageSizeInfo } from 'mdast-react-render/lib/utils'
import { getResizedSrcs } from './utils'
import LazyImage from '../LazyLoad/Image'

const styles = {
  image: css({
    display: 'block',
    width: '100%'
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
      size: sizeProp,
      aboveTheFold
    } = this.props

    const size = sizeProp || (sizeProp === undefined && imageSizeInfo(src))
    const aspectRatio = size ? size.width / size.height : undefined

    const image = isFinite(aspectRatio)
      ? <LazyImage attributes={attributes} visible={aboveTheFold}
          aspectRatio={aspectRatio}
          src={src} srcSet={srcSet} alt={alt} />
      : <img {...attributes} {...styles.image}
          src={src} srcSet={srcSet} alt={alt} />

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
  maxWidth: PropTypes.number,
  aboveTheFold: PropTypes.bool
}

Image.utils = {
  getResizedSrcs
}

export default Image
