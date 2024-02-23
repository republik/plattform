import { AudioFeedDocument } from './../../../../graphql/republik-api/gql/graphql'
import { createHash } from 'crypto'
import { getFeed } from './lib/feed'
import { getServerClient } from '@app/lib/apollo/server'

// const CODES = [
//   'ceee410c-ff4d-49a1-a8d2-098ed37d4185',
//   '5e9175b1-f03f-4f47-b2e7-2c1b7e448b53',
//   '3b7b38d9-d7a1-48b4-be4c-ad3f6113f34f',
//   '7a73f1b4-83d0-4974-b8b0-7041c277c04d',
//   'a822c2b2-fc71-4942-9b9a-6d6d51cc47bb',
// ]

export async function GET(req: Request) {
  try {
    const result = await getServerClient(req).query({
      query: AudioFeedDocument,
      context: {
        headers: {
          authorization: `DocumentApiKey ${process.env.SSG_DOCUMENTS_API_KEY}`,
        },
      },
    })

    if (result.errors) {
      console.error(result.errors)
      return new Response('Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    const rssString = await getFeed(result.data.feed, req)

    // Create response with RSS feed
    const response = new Response(rssString, {
      headers: {
        'Content-Type': 'application/rss+xml',
        Etag: createHash('md5').update(rssString).digest('hex').slice(0, 16),
      },
    })
    return response
  } catch {
    return new Response('Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
