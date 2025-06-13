import { InMemoryCache, ApolloClient } from '@apollo/client-integration-nextjs'
import { HttpLink, NormalizedCacheObject } from '@apollo/client'

/**
 * Get a apollo client to interact with DatoCMS on the server.
 *
 * @returns ApolloClient to interact with DatoCMS
 */
export function getCMSClientBase({
  draftMode,
}: {
  draftMode?: boolean
}): ApolloClient<NormalizedCacheObject> {
  if (!process.env.DATO_CMS_API_URL) {
    throw new Error('Missing DatoCMS API URL')
  }
  if (!process.env.DATO_CMS_API_TOKEN) {
    throw new Error('Missing DatoCMS API token')
  }

  const headers = {
    Authorization: process.env.DATO_CMS_API_TOKEN,
    'X-Exclude-Invalid': 'true',
  }

  if (process.env.DATO_CMS_ENVIRONMENT) {
    headers['X-Environment'] = process.env.DATO_CMS_ENVIRONMENT
  }

  if (process.env.DATO_CMS_INCLUDE_DRAFTS === 'true' || draftMode) {
    headers['X-Include-Drafts'] = 'true'
  }

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.DATO_CMS_API_URL,
      headers,
    }),
  })
}
