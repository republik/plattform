import { NormalizedCacheObject } from '@apollo/client'
import type { ApolloClient } from '@apollo/client-integration-nextjs'
import { getCMSClientBase } from './cms-client-base'
import { draftMode } from 'next/headers'

/**
 * Get a apollo client to interact with DatoCMS on the server.
 *
 * Sets Draft Mode automatically based on next/headers. If you want to explicitly set it
 * or use it in the Pages directory, import from @app/lib/apollo/cms-client-base
 *
 * @returns ApolloClient to interact with DatoCMS
 */
export async function getCMSClient(): Promise<
  ApolloClient<NormalizedCacheObject>
> {
  return getCMSClientBase({ draftMode: (await draftMode()).isEnabled })
}
