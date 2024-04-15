import { generateShareImage } from '@app/app/(campaign)/jetzt/[code]/generate-share-image'

export const contentType = 'image/png'

export default async function OpenGraphImage({
  params,
}: {
  params: { code: string }
}) {
  return generateShareImage({
    code: params.code,
    showPortrait: false,
    orientation: 'landscape',
  })
}
