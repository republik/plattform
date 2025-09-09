import { Interaction } from '@project-r/styleguide'
import Frame from 'components/Frame'
import { FRONT_QUERY } from 'components/Front/graphql/getFrontQuery.graphql'
import { createGetStaticProps } from 'lib/apollo/helpers'
import { PUBLIC_BASE_URL } from 'lib/constants'
import { useTranslation } from 'lib/withT'
import Front, { RenderFront } from '../components/Front'

const FRONT_PATH = '/'

const FrontPage = ({ front }) => {
  const { t } = useTranslation()

  const meta = front && {
    ...front.meta,
    title: front.meta.title || t('pages/magazine/title'),
    url: `${PUBLIC_BASE_URL}${front.meta.path}`,
  }

  return (
    <Frame hasOverviewNav raw meta={meta}>
      {front.meta.prepublication && (
        <div>
          <Interaction.P>{t('front/prepublication/notice')}</Interaction.P>
        </div>
      )}
      <RenderFront front={front} nodes={front.children.nodes} />
    </Frame>
  )
}

export default FrontPage

export const getStaticProps = createGetStaticProps<unknown>(
  async (client) => {
    // Throw error to fail build if the key is not defined

    // Query the front-document
    const frontQueryResult = await client.query({
      query: FRONT_QUERY,
      variables: {
        path: FRONT_PATH,
        // first: finite ? 1000 : 15,
        first: 100,
        // before: finite ? 'end' : undefined,
        before: 'end',
        // only: params?.extractId,
      },
    })

    const front = frontQueryResult.data?.front

    console.log(front.children.pageInfo, front.children.nodes.length)

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
