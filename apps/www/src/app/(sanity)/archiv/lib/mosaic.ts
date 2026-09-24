import type { TeaserImageSizes } from '@/app/(sanity)/components/teaser/large/helpers'

// Teasers are laid out at front width and zoomed down into their column.
export const RENDER_WIDTH = 1175

// Image sizes for the mosaic's columns: 1 below md, then 2, 3 and 4. Split and
// vignette teasers stack their image below md, so it spans the tile there.
export const ARCHIVE_IMAGE_SIZES: TeaserImageSizes = {
  full: '(min-width: 1400px) 25vw, (min-width: 1025px) 33vw, (min-width: 768px) 50vw, 100vw',
  half: '(min-width: 1400px) 13vw, (min-width: 1025px) 17vw, (min-width: 768px) 25vw, 100vw',
}
