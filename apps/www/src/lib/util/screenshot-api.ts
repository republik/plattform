import { SCREENSHOT_SERVER_BASE_URL } from 'lib/constants'

export function screenshotUrl({
  url,
  width,
  height,
  version,
}: {
  url: string
  width?: number
  height?: number
  version?: string
}) {
  const imageUrl = new URL('/api/screenshot', SCREENSHOT_SERVER_BASE_URL)

  imageUrl.searchParams.set('url', url)

  if (width) {
    imageUrl.searchParams.set('width', width.toString())
  }
  if (height) {
    imageUrl.searchParams.set('height', height.toString())
  }
  if (version) {
    imageUrl.searchParams.set('version', version)
  }

  return imageUrl.toString()
}
