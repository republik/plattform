import {
  NextSSRInMemoryCache,
  NextSSRApolloClient,
} from '@apollo/experimental-nextjs-app-support/ssr'
import { HttpLink, NormalizedCacheObject } from '@apollo/client'

/**
 * Get a apollo client to interact with DatoCMS on the server.
 *
 * @returns ApolloClient to interact with DatoCMS
 */
export function getCMSClient(): NextSSRApolloClient<NormalizedCacheObject> {
  if (!process.env.DATO_CMS_API_URL) {
    throw new Error('Missing DatoCMS API URL')
  }
  if (!process.env.DATO_CMS_API_TOKEN) {
    throw new Error('Missing DatoCMS API token')
  }

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link: new HttpLink({
      uri: process.env.DATO_CMS_API_URL,
      headers: {
        Authorization: `${process.env.DATO_CMS_API_TOKEN}`,
        // forbid invalid content to allow strict type checking
        'X-Exclude-Invalid': 'true',
        'X-Environment': process.env.DATO_CMS_ENVIRONMENT ?? 'main',
      },
    }),
  })
}
