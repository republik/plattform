import { NextRequest } from 'next/server'
import { generateShareImage } from '../generate-share-image'

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { code: string }
  },
) {
  return generateShareImage({ code: params.code, showPortrait: false })
}
