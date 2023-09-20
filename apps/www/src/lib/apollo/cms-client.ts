import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

/**
 * Get a apollo client to interact with DatoCMS on the server.
 *
 * @returns ApolloClient to interact with DatoCMS
 */
export function getCMSClient() {
  if (!process.env.DATO_CMS_API_URL) {
    throw new Error('Missing DatoCMS API URL')
  }
  if (!process.env.DATO_CMS_API_TOKEN) {
    throw new Error('Missing DatoCMS API token')
  }

  const link = new HttpLink({
    uri: process.env.DATO_CMS_API_URL,
    headers: {
      Authorization: `${process.env.DATO_CMS_API_TOKEN}`,
      // forbid invalid content to allow strict type checking
      'X-Exclude-Invalid': 'true',
    },
  })

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  return client
}
