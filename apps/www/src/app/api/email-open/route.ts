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
  const url = request.nextUrl.searchParams.get('url')

  // If url param is not set, just do nothing
  if (url) {
    // See https://plausible.io/docs/events-api
    try {
      const plausibleRes = await fetch('https://plausible.io/api/event', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': request.headers.get('user-agent'),
          'x-forwarded-for': request.headers.get('x-forwarded-for'),
        },
        body: JSON.stringify({
          domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
          name: 'pageview',
          url,
          props: {
            type: 'email-open',
            user_type: 'email',
          },
        }),
      })

      if (!plausibleRes.ok) {
        console.error('Email tracking failed', await plausibleRes.text())
      }
    } catch (err) {
      console.error('Email tracking failed', err)
    }
  }

  const img = await (await fetch(pixel)).blob()
  const res = new Response(img, {
    headers: {
      'cache-control': 'no-cache, no-store',
    },
  })

  return res
}
