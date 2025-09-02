import { useRouter } from 'next/router'
import Front from '../components/Front'
import { createGetStaticProps, withDefaultSSR } from 'lib/apollo/helpers'
import { FRONT_QUERY } from 'components/Front/graphql/getFrontQuery.graphql'

const FRONT_PATH = '/'

const FrontPage = ({ front }) => {
  return (
    <Front
      shouldAutoRefetch
      hasOverviewNav
      front={front}
      renderBefore={undefined}
      renderAfter={undefined}
      containerStyle={undefined}
      serverContext={undefined}
      documentPath={FRONT_PATH}
    />
  )
}

export default FrontPage

export const getStaticProps = createGetStaticProps<unknown, Params>(
  async (client, { params }) => {
    // Throw error to fail build if the key is not defined

    // Query the front-document
    const frontQueryResult = await client.query({
      query: FRONT_QUERY,
      variables: {
        path: FRONT_PATH,
        // first: finite ? 1000 : 15,
        first: 1000,
        // before: finite ? 'end' : undefined,
        before: 'end',
        // only: params?.extractId,
      },
    })

    const front = frontQueryResult.data?.front

    // const feedNode = front?.children?.nodes.find((c) => c.id === 'feed')

    // // Query front-feed if present
    // if (feedNode) {
    //   // Start query options - (identical to code in www/components/Front/withData.js)
    //   const feedNodeIndex =
    //     frontQueryResult.data.front.children.nodes.indexOf(feedNode)

    //   const priorRepoIds = front.children.nodes
    //     .slice(0, feedNodeIndex)
    //     .map((node) => node?.body?.data?.urlMeta?.repoId)
    //     .filter(Boolean)

    //   const options = getFrontFeedOptions({
    //     lastPublishedAt: frontQueryResult.data.front.lastPublishedAt,
    //     priorRepoIds,
    //     ...feedNode.body.data,
    //   })
    //   // End query options

    //   await client.query({
    //     query: FRONT_FEED_QUERY,
    //     variables: options.variables,
    //   })
    // }

    return {
      props: {
        front,
      },
      revalidate: 5 * 60,
    }
  },
  // {
  //   authorization: `DocumentApiKey ${process.env.SSG_DOCUMENTS_API_KEY}`,
  // },
)
