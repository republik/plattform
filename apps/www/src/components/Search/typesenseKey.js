import { gql } from '@apollo/client'
import Typesense from 'typesense'

const getSearchApiKey = gql`
  query getSearchApiKey {
    searchApiKey {
      key
      expiresAt
    }
  }
`

let clientPromise = null

const buildClient = (apiKey) =>
  new Typesense.Client({
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
        port: Number(process.env.NEXT_PUBLIC_TYPESENSE_PORT || 443),
        protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'https',
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 5,
  })

const fetchScopedKey = async (apolloClient) => {
  const { data } = await apolloClient.query({
    query: getSearchApiKey,
    fetchPolicy: 'network-only',
  })
  return data.searchApiKey.key
}

/**
 * Lazily fetches a scoped Typesense search key via GraphQL and builds a
 * client from it. Cached across calls so concurrent/repeat search requests
 * share one key/client instead of re-minting a key per request.
 *
 * NEXT_PUBLIC_TYPESENSE_LOCAL_KEY is a local-dev-only escape hatch: it skips
 * the searchApiKey GraphQL round trip entirely and uses that key directly,
 * for testing against a local Typesense before the searchApiKey resolver
 * (from hd/sanity-backend-changes) is merged/deployed. Never set in
 * staging/production -- there the scoped key is required.
 */
const getTypesenseClient = (apolloClient) => {
  if (!clientPromise) {
    clientPromise = process.env.NEXT_PUBLIC_TYPESENSE_LOCAL_KEY
      ? Promise.resolve(buildClient(process.env.NEXT_PUBLIC_TYPESENSE_LOCAL_KEY))
      : fetchScopedKey(apolloClient).then(buildClient)
  }
  return clientPromise
}

/**
 * Drops the cached client/key so the next getTypesenseClient() call mints a
 * fresh one. Call this after a request fails due to an expired/invalid key.
 */
const resetTypesenseClient = () => {
  clientPromise = null
}

const isAuthError = (error) =>
  error?.httpStatus === 401 || error?.httpStatus === 403

/**
 * Runs a Typesense operation, transparently minting a fresh scoped key and
 * retrying once if the current one has expired.
 */
export const withTypesenseClient = async (apolloClient, run) => {
  const client = await getTypesenseClient(apolloClient)
  try {
    return await run(client)
  } catch (error) {
    if (!isAuthError(error)) {
      throw error
    }
    resetTypesenseClient()
    const freshClient = await getTypesenseClient(apolloClient)
    return run(freshClient)
  }
}
