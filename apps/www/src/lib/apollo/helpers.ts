import {
  makeSSGDataFetchingHelpers,
  makeSSRDataFetchingHelpers,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { IncomingMessage } from 'http'
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

export type ProvidedUserAgentProps = { providedUserAgent?: string }

/**
 * `providedUserAgent` is consumed by `UserAgentProvider` in `pages/_app` to make
 * the request user agent available during SSR. Pages that declare their own
 * `getServerSideProps` should include these props instead of using
 * `defaultServerSideProps`.
 */
export function providedUserAgentProps(
  req: IncomingMessage,
): ProvidedUserAgentProps {
  const providedUserAgent = req.headers['user-agent']
  return providedUserAgent ? { providedUserAgent } : {}
}

/**
 * Drop-in replacement for the `withDefaultSSR` HOC.
 *
 * Pages Router pages whose only data fetching is `getInitialProps` are in none
 * of the buckets Next.js' build adapter emits an RSC fallback output for
 * (`staticPages`, the prerender manifest, `serverPropsPages`). Without a
 * `<page>.rsc` output such a page is invisible to Vercel's filesystem phase for
 * RSC requests, so App Router navigations fall through to the dynamic routes and
 * get served by `app/(sanity)/[...path]` instead.
 *
 * Declaring `getServerSideProps` puts the page into `serverPropsPages`, which
 * restores the RSC fallback. It also keeps the things `withDefaultSSR` provided
 * besides running the queries found in the component tree: request headers are
 * forwarded to the API, `me` is loaded into the SSR Apollo cache and the request
 * user agent stays available during SSR.
 */
export const defaultServerSideProps =
  createGetServerSideProps<ProvidedUserAgentProps>(async ({ ctx }) => ({
    props: providedUserAgentProps(ctx.req),
  }))
