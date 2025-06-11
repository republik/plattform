import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { imageSizeInfo } from '@republik/mdast-react-render'
import { getResizedSrcs } from './utils'
import LazyImage from '../LazyLoad/Image'
import { sansSerifRegular12, sansSerifRegular15 } from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'
import SwitchImage from './SwitchImage'
import { IconGallery } from '@republik/icons'

export const MIN_GALLERY_IMG_WIDTH = 600

const styles = {
  image: css({
    width: '100%',
  }),
  imageContainer: css({
    position: 'relative',
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
      lineHeight: '18px',
    },
  }),
  maxWidth: css({
    display: 'block',
  }),
}

type GalleryButtonProps = {
  gallerySize: number
  onClick: () => void
}

const GalleryButton = ({ gallerySize, onClick }: GalleryButtonProps) => {
  return (
    <div {...styles.galleryButton} onClick={onClick}>
      <span style={{ paddingRight: 10 }}>
        <IconGallery color='#fff' />
      </span>
      {`${gallerySize} Bilder`}
    </div>
  )
}

const Image = (props) => {
  const {
    src,
    dark,
    srcSet,
    alt,
    attributes = {},
    maxWidth,
    size: sizeProp,
    aboveTheFold,
    enableGallery = false,
    gallerySize,
  } = props

  // FIXME: use real context here
  const context = { toggleGallery: (bla: string) => {} }

  const onClick =
    enableGallery && context.toggleGallery
      ? () => context.toggleGallery(src)
      : undefined

  const size = sizeProp || (sizeProp === undefined && imageSizeInfo(src))
  let aspectRatio = size ? size.width / size.height : undefined
  if (dark?.size) {
    aspectRatio = Math.min(aspectRatio, dark.size.width / dark.size.height)
  }

  const image = isFinite(aspectRatio) ? (
    <LazyImage
      attributes={attributes}
      visible={aboveTheFold}
      aspectRatio={aspectRatio}
      src={src}
      dark={dark}
      srcSet={srcSet}
      alt={alt}
      onClick={onClick}
      sizes={undefined}
    />
  ) : (
    <SwitchImage
      {...attributes}
      {...styles.image}
      src={src}
      srcSet={srcSet}
      dark={dark}
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
      // recreate dom for chaning src to ensure old image is not shown while new one loads
      key={src}
      style={{
        cursor: enableGallery // during SSR context.toggleGallery and therefore onClick are not present
          ? 'zoom-in'
          : undefined,
      }}
    >
      {wrappedImage}
    </div>
  )
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  dark: PropTypes.shape({
    src: PropTypes.string.isRequired,
    srcSet: PropTypes.string,
  }),
  srcSet: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  maxWidth: PropTypes.number,
  aboveTheFold: PropTypes.bool,
  enableGallery: PropTypes.bool,
  gallerySize: PropTypes.number,
}

Image.contextTypes = {
  toggleGallery: PropTypes.func,
}

Image.utils = {
  getResizedSrcs,
}

export default Image
