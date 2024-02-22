import { NextRequest } from 'next/server'
import { generateShareImage } from './generate-share-image'

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { code: string }
  },
) {
  const searchParams = request.nextUrl.searchParams
  const showPortrait =
    searchParams.get('show_portrait') === 'true' ? true : false
  const orientation =
    searchParams.get('orientation') === 'landscape' ? 'landscape' : 'portrait'

  return generateShareImage({ code: params.code, orientation, showPortrait })
}
