import { headers } from 'next/headers'
import { revalidateBasedOnReqBody } from './lib/revalidate-utils'

/**
 * Endpoint to trigger revalidation of a path or tag(s).
 * What is to be revalidated is defined by the request body.
 * @param {Request} req Request object (the body should be a JSON object)
 * @returns {Response} Response object
 */
export async function POST(req: Request) {
  if (!process.env.REVALIDATION_SECRET) {
    console.info('REVALIDATION_SECRET is not set')
    return new Response(undefined, {
      status: 400,
      statusText: 'revalidation not configured',
    })
  }

  const reqHeaders = await headers()
  if (
    reqHeaders.get('X-REVALIDATION-SECRET') !== process.env.REVALIDATION_SECRET
  ) {
    // if revalidation secret is not set, return 401
    return new Response(undefined, {
      status: 401,
      statusText: 'not authorized',
    })
  }

  try {
    const body = await req.json()
    await revalidateBasedOnReqBody(body)

    return new Response(undefined, {
      status: 203,
      statusText: 'revalidation triggered',
    })
  } catch (e) {
    return new Response(undefined, {
      status: 400,
      statusText: 'invalid request body',
    })
  }
}
