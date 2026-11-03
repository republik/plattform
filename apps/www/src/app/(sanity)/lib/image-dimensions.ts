export type ImageDimensions = {
  width: number
  height: number
  aspectRatio: number
}

// Asset filenames encode the original dimensions, e.g. `<id>-3130x2075.jpg`
const ASSET_FILENAME_PATTERN = /-(\d+)x(\d+)\.[a-z0-9]+$/i

// Parses the original image dimensions from a Sanity image asset URL,
// independent of the CDN host
export function getImageDimensions(src: string): ImageDimensions {
  const filename = new URL(src).pathname.split('/').pop() ?? ''
  const match = filename.match(ASSET_FILENAME_PATTERN)

  if (!match) {
    throw new Error(`Failed to parse image dimensions from URL: ${src}`)
  }

  const width = Number(match[1])
  const height = Number(match[2])

  return { width, height, aspectRatio: width / height }
}
