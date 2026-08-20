import Typesense from 'typesense'
import { SearchApiKeyDocument } from '#graphql/republik-api/__generated__/gql/graphql'

import {
  TYPESENSE_HOST,
  TYPESENSE_PORT,
  TYPESENSE_PROTOCOL,
} from '@/lib/constants'

let clientPromise = null

const buildClient = (apiKey) =>
  new Typesense.Client({
    nodes: [
      {
        host: TYPESENSE_HOST,
        port: TYPESENSE_PORT,
        protocol: TYPESENSE_PROTOCOL,
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 5,
  })

const fetchScopedKey = async (apolloClient) => {
  const { data } = await apolloClient.query({
    query: SearchApiKeyDocument,
    fetchPolicy: 'network-only',
  })
  return data.searchApiKey.key
}

/**
 * Lazily fetches a scoped Typesense search key via GraphQL and builds a
 * client from it. Cached across calls so concurrent/repeat search requests
 * share one key/client instead of re-minting a key per request.
 */
const getTypesenseClient = (apolloClient) => {
  if (!clientPromise) {
    clientPromise = fetchScopedKey(apolloClient).then(buildClient)
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
export const runWithTypesenseClient = async (apolloClient, run) => {
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
