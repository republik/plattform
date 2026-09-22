/**
 * Thin Typesense client wrapper.
 *
 * Configuration comes from environment variables:
 *  - TYPESENSE_HOST              hostname, default "localhost"
 *  - TYPESENSE_PORT              port, default "8108"
 *  - TYPESENSE_PROTOCOL          "http" | "https", default "http"
 *  - TYPESENSE_ADMIN_API_KEY     admin api key, required
 */
import Typesense, { Client } from 'typesense'

let client: Client | undefined

const buildClient = (): Client => {
  const {
    TYPESENSE_HOST = 'localhost',
    TYPESENSE_PORT = '8108',
    TYPESENSE_PROTOCOL = 'http',
    TYPESENSE_ADMIN_API_KEY,
  } = process.env

  if (!TYPESENSE_ADMIN_API_KEY) {
    throw new Error(
      'TYPESENSE_ADMIN_API_KEY is not set, cannot connect to Typesense',
    )
  }

  return new Typesense.Client({
    nodes: [
      {
        host: TYPESENSE_HOST,
        port: Number(TYPESENSE_PORT),
        protocol: TYPESENSE_PROTOCOL,
      },
    ],
    apiKey: TYPESENSE_ADMIN_API_KEY,
    connectionTimeoutSeconds: 5,
  })
}

/**
 * Returns a lazily instantiated, memoized Typesense client.
 */
const getClient = (): Client => {
  if (!client) {
    client = buildClient()
  }
  return client
}

export { getClient }
