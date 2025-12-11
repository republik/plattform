import { ForceOnboarding } from '@app/components/onboarding/force-onboarding'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import { useEffect } from 'react'
import Front from '../components/Front'
import { FRONT_QUERY } from '../components/Front/graphql/getFrontQuery.graphql'
import {
  FRONT_FEED_QUERY,
  getFrontFeedOptions,
} from '../components/Front/withData'
import { createGetStaticProps } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'

const FRONT_PAGE_SSG_REVALIDATE = 60 // revalidate every minute
const FRONT_PATH = '/'

const FrontPage = () => {
  const router = useRouter()
  const { meLoading, hasAccess } = useMe()

  useEffect(() => {
    if (meLoading) return
    // reload to re-trigger the middleware to rewrite to the marketing-page
    if (!hasAccess) {
      window.location.reload()
    }
  }, [meLoading, hasAccess])

  return (
    <ForceOnboarding>
      <Front
        shouldAutoRefetch
        hasOverviewNav
        extractId={router.query.extractId}
        finite
        renderBefore={undefined}
        renderAfter={undefined}
        containerStyle={undefined}
        serverContext={undefined}
        documentPath={FRONT_PATH}
      />
    </ForceOnboarding>
  )
}

export default FrontPage

interface Params extends ParsedUrlQuery {
  extractId?: string
}

export const getStaticProps = createGetStaticProps<unknown, Params>(
  async (client, { params }) => {
    // Throw error to fail build if the key is not defined
    if (!process.env.SSG_DOCUMENTS_API_KEY) {
      throw new Error('Missing SSG_DOCUMENTS_API_KEY environment variable')
    }

    // Query the front-document
    const frontQueryResult = await client.query({
      query: FRONT_QUERY,
      variables: {
        path: FRONT_PATH,
        // first: finite ? 1000 : 15,
        first: 1000,
        // before: finite ? 'end' : undefined,
        before: 'end',
        only: params?.extractId,
      },
    })
    const front = frontQueryResult.data?.front
    const feedNode = front?.children?.nodes.find((c) => c.id === 'feed')

    // Query front-feed if present
    if (feedNode) {
      // Start query options - (identical to code in www/components/Front/withData.js)
      const feedNodeIndex =
        frontQueryResult.data.front.children.nodes.indexOf(feedNode)

      const priorRepoIds = front.children.nodes
        .slice(0, feedNodeIndex)
        .map((node) => node?.body?.data?.urlMeta?.repoId)
        .filter(Boolean)

      const options = getFrontFeedOptions({
        lastPublishedAt: frontQueryResult.data.front.lastPublishedAt,
        priorRepoIds,
        ...feedNode.body.data,
      })
      // End query options

      await client.query({
        query: FRONT_FEED_QUERY,
        variables: options.variables,
      })
    }

    return {
      props: {},
      revalidate: FRONT_PAGE_SSG_REVALIDATE,
    }
  },
  {
    authorization: `DocumentApiKey ${process.env.SSG_DOCUMENTS_API_KEY}`,
  },
)
