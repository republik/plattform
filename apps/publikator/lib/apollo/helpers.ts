import { makeWithDefaultSSR } from '@republik/nextjs-apollo-client'
import { initializeApollo } from '.'
import { ME_QUERY } from '../withMe'

export const withDefaultSSR = makeWithDefaultSSR(
  initializeApollo,
  async (client) => {
    await client.query({
      query: ME_QUERY,
    })
  },
)
