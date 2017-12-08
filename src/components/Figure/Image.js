import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'
import { parse, format } from 'url'

const styles = {
  image: css({
    width: '100%'
  }),
  imageLoading: css({
    backgroundColor: '#eee',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    height: 0
  })
}

const imageSizeInfo = url => {
  const urlObject = parse(url, true)
  const { size } = urlObject.query
  if (!size) {
    return null
  }
  const [width, height] = size.split('x')
  return {
    width,
    height
  }
}

const imageResizeUrl = (url, size) => {
  if (!url) {
    return url
  }

  const urlObject = parse(url, true)
  if (urlObject.protocol === 'data:') {
    return url
  }

  urlObject.query.resize = size
  // ensure format calculates from query object
  urlObject.search = undefined

  return format(urlObject)
}

class Image extends Component {
  constructor(props) {
    super(props)
    this.state = { loadStatus: 'loading' }

    this.handleLoaded = this.handleLoaded.bind(this)
  }

  handleLoaded() {
    this.setState({ loadStatus: 'loaded' })
  }

  render() {
    const { src, alt, attributes = {}, resize } = this.props
    const { loadStatus } = this.state
    const resizedSrc = resize ? imageResizeUrl(src, resize) : src
    const sizeInfo = imageSizeInfo(src)
    const aspectRatio =
      sizeInfo && sizeInfo.width ? sizeInfo.width / sizeInfo.height : undefined

    return (
      <img
        {...attributes}
        {...css(
          styles.image,
          aspectRatio && loadStatus === 'loading'
            ? merge(styles.imageLoading, {
                paddingBottom: `${100 / aspectRatio}%`
              })
            : {}
        )}
        onLoad={this.handleLoaded}
        src={resizedSrc}
        alt={alt}
      />
    )
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  resize: PropTypes.string
}

export default Image
