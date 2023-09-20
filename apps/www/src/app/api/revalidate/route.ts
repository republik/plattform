import { headers } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Endpoint to trigger revalidation of a path or tag(s).
 * What is to be revalidated is defined by the X-REVALIDATION-KEY header on the request.
 * The value of the header can be either:
 * - path:/path/to/revalidate
 * - tag:tag-to-revalidate
 * - tags:tag1,tag2,tag3
 *
 * The endpoint is protected by a secret, which is set in the REVALIDATION_SECRET environment variable.
 * The secret must be sent in the X-REVALIDATION-SECRET header.
 *
 * @returns {Response} Response object
 */
export async function POST() {
  if (!process.env.REVALIDATION_SECRET) {
    console.info('REVALIDATION_SECRET is not set')
    return new Response(undefined, {
      status: 400,
      statusText: 'revalidation not configured',
    })
  }

  const reqHeaders = headers()
  if (
    reqHeaders.get('X-REVALIDATION-SECRET') !== process.env.REVALIDATION_SECRET
  ) {
    // if revalidation secret is not set, return 401
    return new Response(undefined, {
      status: 401,
      statusText: 'not authorized',
    })
  }

  const revalidationKey = reqHeaders.get('X-REVALIDATION-KEY')
  if (!revalidationKey) {
    return new Response(undefined, {
      status: 400,
      statusText: 'revalidation key not set',
    })
  }

  if (revalidationKey.startsWith('path:/')) {
    // revalidate path
    revalidatePath(revalidationKey.replace('path:', ''))
  } else if (revalidationKey.startsWith('tag:')) {
    // revalidate tag
    revalidateTag(revalidationKey.replace('tag:', ''))
  } else if (revalidationKey.startsWith('tags:')) {
    // revalidate tags
    revalidationKey
      .replace('tags:', '')
      .split(',')
      .map((tag) => tag.trim())
      .forEach((tag) => revalidateTag(tag))
  } else {
    return new Response(undefined, {
      status: 400,
      statusText: 'revalidation key invalid',
    })
  }

  console.info(`revalidation triggered for ${revalidationKey}`)

  return new Response(undefined, {
    status: 203,
    statusText: 'revalidation triggered',
  })
}
