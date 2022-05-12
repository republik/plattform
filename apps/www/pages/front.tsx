import { useRouter } from 'next/router'
import Front from '../components/Front'
import createGetStaticProps from '../lib/helpers/createGetStaticProps'
import { FRONT_QUERY } from '../components/Front/graphql/getFrontQuery.graphql'

const FRONT_PATH = '/'

const FrontPage = () => {
  const router = useRouter()
  return (
    <Front
      shouldAutoRefetch
      hasOverviewNav
      extractId={router.query.extractId}
      finite
      renderBefore={undefined}
      renderAfter={undefined}
      containerStyle={undefined}
      serverContext={undefined}
      isEditor={undefined}
      documentPath={FRONT_PATH}
    />
  )
}

export default FrontPage

export const getStaticProps = createGetStaticProps(
  async (client, params) => {
    try {
      const test = await client.query({
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

      console.debug('test', test)

      return {
        props: {},
        revalidate: 60 * 5,
      }
    } catch (e) {
      console.error(e)
    }
  },
  {
    authorization: `DocumentApiKey ${process.env.SSG_API_KEY}`,
  },
)
