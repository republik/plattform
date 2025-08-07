import { NextRequest } from 'next/server'

// A transparent 1x1 px PNG
const pixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC'

/**
 * Route handler to track email opens with Plausible.
 *
 * Embed in emails as an image and add the `url` param. E.g. <img src="https://www.republik.ch/api/email-open?url=<encoded_url>">
 */
export async function GET(request: NextRequest) {
  const img = await (await fetch(pixel)).blob()
  const res = new Response(img, {
    headers: {
      'cache-control': 'no-cache, no-store',
    },
  })

  return res
}
