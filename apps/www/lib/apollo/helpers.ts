import {
  makeSSGDataFetchingHelpers,
  makeSSRDataFetchingHelpers,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { initializeApollo } from '.'
import { MeObjectType } from '../context/MeContext'
import { meQuery } from './withMe'

// Prepare Next.js data-fetching helpers with the generated initializeApollo function
export const { createGetStaticProps, createGetStaticPaths } =
  makeSSGDataFetchingHelpers(initializeApollo)

export const createGetServerSideProps =
  makeSSRDataFetchingHelpers<MeObjectType>(initializeApollo, async (client) => {
    const {
      data: { me },
    } = await client.query<{ me?: MeObjectType }>({
      query: meQuery,
    })
    return me
  })

export const withDefaultSSR = makeWithDefaultSSR(
  initializeApollo,
  async (client) => {
    await client.query({
      query: meQuery,
    })
  },
)
