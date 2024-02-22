import { generateShareImage } from './share-image/generate-share-image'

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
