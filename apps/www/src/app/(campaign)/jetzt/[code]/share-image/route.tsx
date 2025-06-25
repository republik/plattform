import { NextRequest } from 'next/server'
import { generateShareImage } from '../generate-share-image'

export async function GET(
  request: NextRequest,
  props: {
    params: Promise<{ code: string }>
  }
) {
  const params = await props.params;
  return generateShareImage({ code: params.code, showPortrait: false })
}
