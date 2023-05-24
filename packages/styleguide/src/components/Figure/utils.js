import {
  imageSizeInfo,
  imageResizeUrl,
} from '@republik/mdast-react-render/lib/utils'
import { MAX_WIDTH_MOBILE } from '../Center'

const getSrcSet = (src, widths) =>
  widths
    .filter(Boolean)
    .map((size) => [imageResizeUrl(src, `${size}x`), `${size}w`].join(' '))
    .join(',')

export const getResizedSrcs = (
  src,
  srcDark,
  displayWidth,
  setMaxWidth = true,
) => {
  if (!src) {
    return {
      size: null,
    }
  }
  const sizeInfo = imageSizeInfo(src)
  if (!sizeInfo || (srcDark && !imageSizeInfo(srcDark))) {
    return {
      src,
      dark: {
        src: srcDark,
      },
      size: null,
    }
  }
  const size = {
    width: +sizeInfo.width,
    height: +sizeInfo.height,
  }

  const maxWidth = size.width

  // The optional .webp is because the backend accidentally adds this currently (2019-02-06T10:24:00.000Z)
  if (src.match(/\.svg(\.webp)?($|\?|#)/)) {
    // no maxWidth because svgs can always be blown up
    return {
      src,
      dark: {
        src: srcDark,
      },
      size,
    }
  }

  const defaultWidth = Math.min(
    Math.max(
      displayWidth,
      // images could always be shown full width on mobile
      MAX_WIDTH_MOBILE,
    ),
    maxWidth,
  )

  const isHighRes = defaultWidth * 2 <= maxWidth
  const highResWidths = [
    Math.round(defaultWidth * 0.5),
    defaultWidth,
    defaultWidth < maxWidth && (isHighRes ? defaultWidth * 2 : maxWidth),
  ]

  const dark = srcDark
    ? {
        src: imageResizeUrl(srcDark, `${defaultWidth}x`),
        srcSet: getSrcSet(srcDark, highResWidths),
      }
    : null

  return {
    src: imageResizeUrl(src, `${defaultWidth}x`),
    srcSet: getSrcSet(src, highResWidths),
    dark,
    maxWidth: setMaxWidth ? maxWidth : undefined,
    size,
  }
}
