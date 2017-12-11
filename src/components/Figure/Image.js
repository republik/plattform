import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { imageSizeInfo, imageResizeUrl } from 'mdast-react-render/lib/utils'

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
  })
}

class Image extends Component {
  // This will eventually become a stateful component.

  render() {
    const { src, alt, attributes = {}, resize } = this.props
    const resizedSrc = resize ? imageResizeUrl(src, resize) : src
    const sizeInfo = imageSizeInfo(src)
    const aspectRatio = sizeInfo ? sizeInfo.width / sizeInfo.height : undefined

    if (isFinite(aspectRatio)) {
      return (
        <span
          {...styles.aspectRatio}
          style={{ paddingBottom: `${100 / aspectRatio}%` }}
        >
          <img
            {...attributes}
            {...styles.wrappedImage}
            src={resizedSrc}
            alt={alt}
          />
        </span>
      )
    } else {
      return (
        <img {...attributes} {...styles.image} src={resizedSrc} alt={alt} />
      )
    }
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  resize: PropTypes.string
}

export default Image
