import { generateShareImage } from '@app/app/(campaign)/jetzt/[code]/generate-share-image'

export const contentType = 'image/png'

export default async function OpenGraphImage() {
  return generateShareImage({
    showPortrait: false,
    orientation: 'landscape',
  })
}
