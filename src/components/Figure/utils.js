import {
  imageSizeInfo,
  imageResizeUrl
} from 'mdast-react-render/lib/utils'
import {
  MAX_WIDTH_MOBILE
} from '../Center'

export const getResizedSrcs = (src, displayWidth, setMaxWidth = true) => {
  if (!src) {
    return {
      size: null
    }
  }
  const sizeInfo = imageSizeInfo(src)
  if (!sizeInfo) {
    return {
      src,
      size: null
    }
  }
  const size = {
    width: +sizeInfo.width,
    height: +sizeInfo.height
  }

  const maxWidth = size.width
  const defaultWidth = Math.min(
    Math.max(
      displayWidth,
      // images could always be shown full width on mobile
      MAX_WIDTH_MOBILE
    ),
    maxWidth
  )

  const resizedSrc = imageResizeUrl(
    src,
    `${defaultWidth}x`
  )

  let srcSet
  if (defaultWidth < maxWidth) {
    // add high res image
    srcSet = [defaultWidth * 2 <= maxWidth
      ? defaultWidth * 2
      : maxWidth
    ]
      .map(size => [
        imageResizeUrl(src, `${size}x`),
        `${size}w`
      ].join(' '))
      .join(',')
  }

  return {
    src: resizedSrc,
    srcSet,
    maxWidth: setMaxWidth ? maxWidth : undefined,
    size
  }
}
