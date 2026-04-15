import {
  makeSSGDataFetchingHelpers,
  makeSSRDataFetchingHelpers,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { initializeApollo } from '.'
import { MeObjectType } from '../context/MeContext'
import { MeDocument } from '#graphql/republik-api/__generated__/gql/graphql'

// Prepare Next.js data-fetching helpers with the generated initializeApollo function
export const { createGetStaticProps, createGetStaticPaths } =
  makeSSGDataFetchingHelpers(initializeApollo)

export const createGetServerSideProps =
  makeSSRDataFetchingHelpers<MeObjectType>(initializeApollo, async (client) => {
    const {
      data: { me },
    } = await client.query({
      query: MeDocument,
    })
    return me
  })

export const withDefaultSSR = makeWithDefaultSSR(
  initializeApollo,
  async (client) => {
    await client.query({
      query: MeDocument,
    })
  },
)
