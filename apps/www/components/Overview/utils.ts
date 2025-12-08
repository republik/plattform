import { screenshotUrl } from '@app/lib/util/screenshot-api'
import { PUBLIC_BASE_URL } from '../../lib/constants'

export const renderWidth = 1200

// NOTE: This function is still used by Marketing/Carousel.tsx and potentially other components.
// Overview pages now use direct React rendering with renderMdast instead of screenshots.
export const getImgSrc = (
  teaser: { id: string; [key: string]: any },
  path: string = '/',
  size: number = 240,
): string =>
  screenshotUrl({
    url: `${PUBLIC_BASE_URL}${path}?extractId=${teaser.id}`,
    width: renderWidth,
  })
