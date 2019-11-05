import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { imageSizeInfo } from 'mdast-react-render/lib/utils'
import { getResizedSrcs } from './utils'
import LazyImage from '../LazyLoad/Image'
import GalleryIcon from 'react-icons/lib/md/filter'
import { sansSerifRegular12, sansSerifRegular15 } from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  image: css({
    display: 'block',
    width: '100%'
  }),
  imageContainer: css({
    position: 'relative'
  }),
  galleryButton: css({
    position: 'absolute',
    right: 15,
    bottom: 15,
    padding: 10,
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    cursor: 'pointer',
    ...sansSerifRegular12,
    [mUp]: {
      ...sansSerifRegular15,
      lineHeight: '18px'
    }
  }),
  maxWidth: css({
    display: 'block'
  })
}

const GalleryButton = ({ gallerySize, onClick }) => {
  return (
    <div {...styles.galleryButton} onClick={onClick}>
      <span style={{ paddingRight: 10 }}>
        <GalleryIcon color='#fff' />
      </span>
      {`${gallerySize} Bilder`}
    </div>
  )
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
      aboveTheFold,
      enableGallery = false,
      gallerySize
    } = this.props

    const onClick = enableGallery
      ? () => this.context.toggleGallery && this.context.toggleGallery(src)
      : () => {}

    const size = sizeProp || (sizeProp === undefined && imageSizeInfo(src))
    const aspectRatio = size ? size.width / size.height : undefined

    const image = isFinite(aspectRatio) ? (
      <LazyImage
        attributes={attributes}
        visible={aboveTheFold}
        aspectRatio={aspectRatio}
        src={src}
        srcSet={srcSet}
        alt={alt}
        onClick={onClick}
      />
    ) : (
      <img
        {...attributes}
        {...styles.image}
        src={src}
        srcSet={srcSet}
        alt={alt}
        onClick={onClick}
      />
    )

    let wrappedImage = image

    if (maxWidth) {
      wrappedImage = (
        <span {...styles.maxWidth} style={{ maxWidth }}>
          {wrappedImage}
        </span>
      )
    }
    wrappedImage = (
      <>
        {wrappedImage}
        {gallerySize > 0 && (
          <GalleryButton gallerySize={gallerySize} onClick={onClick} />
        )}
      </>
    )
    return (
      <div
        {...styles.imageContainer}
        style={{ cursor: enableGallery ? 'zoom-in' : undefined }}
      >
        {wrappedImage}
      </div>
    )
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
  aboveTheFold: PropTypes.bool,
  enableGallery: PropTypes.bool,
  gallerySize: PropTypes.number
}

Image.contextTypes = {
  toggleGallery: PropTypes.func
}

Image.utils = {
  getResizedSrcs
}

export default Image
