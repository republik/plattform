import { generateShareImage } from '@app/app/(campaign)/jetzt/[code]/generate-share-image'
import { headers } from 'next/headers'

export const contentType = 'image/png'

export default async function OpenGraphImage() {
  await headers() // Keep this here to opt out of static prerendering of this route

  return generateShareImage({
    showPortrait: false,
    orientation: 'landscape',
  })
}
