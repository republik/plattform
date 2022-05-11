import { useRouter } from 'next/router'
import Front from '../components/Front'
import createGetStaticProps from '../lib/helpers/createGetStaticProps'
import { FRONT_QUERY } from '../components/Front/graphql/getFrontQuery.graphql'

const FRONT_PATH = '/front'

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
    />
  )
}

export default FrontPage

export const getStaticProps = createGetStaticProps(async (client, params) => {
  await client.query({
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
  return {
    props: {},
    revalidate: 60 * 5,
  }
})
