import { imageSizeInfo, imageResizeUrl } from '@republik/mdast-react-render'
import { MAX_WIDTH_MOBILE } from '../Center'

function getSrcSet(src: string, widths: number[]): string {
  return widths
    .filter(Boolean)
    .map((size) => [imageResizeUrl(src, `${size}x`), `${size}w`].join(' '))
    .join(',')
}

export type ResizedSrc =
  | {
      src: string
      srcSet?: string
      dark?: {
        src: string
        srcSet?: string
      }
      maxWidth?: number
      size: {
        width: number
        height: number
      } | null
    }
  | {
      size: null
    }

export const getResizedSrcs = (
  src?: string,
  srcDark?: string,
  displayWidth?: number,
  setMaxWidth = true,
): ResizedSrc => {
  if (!src) {
    return {
      size: null,
    }
  }
  const sizeInfo = imageSizeInfo(src)
  if (!sizeInfo || (srcDark && !imageSizeInfo(srcDark))) {
    return {
      src,
      dark: srcDark
        ? {
            src: srcDark,
          }
        : null,
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
      dark: srcDark
        ? {
            src: srcDark,
          }
        : null,
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
