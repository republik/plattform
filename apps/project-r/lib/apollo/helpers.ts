import {
  makeSSGDataFetchingHelpers,
  makeSSRDataFetchingHelpers,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { initializeApollo } from '.'

// Prepare Next.js data-fetching helpers with the generated initializeApollo function
export const { createGetStaticProps, createGetStaticPaths } =
  makeSSGDataFetchingHelpers(initializeApollo)

export const createGetServerSideProps =
  makeSSRDataFetchingHelpers(initializeApollo)

export const withDefaultSSR = makeWithDefaultSSR(initializeApollo)
