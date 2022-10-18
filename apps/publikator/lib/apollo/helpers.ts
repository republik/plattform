import { makeWithDefaultSSR } from '@republik/nextjs-apollo-client'
import { initializeApollo } from '.'
import { meQuery } from '@project-r/styleguide'

export const withDefaultSSR = makeWithDefaultSSR(
  initializeApollo,
  async (client) => {
    await client.query({
      query: meQuery,
    })
  },
)
