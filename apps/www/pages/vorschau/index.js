import { useRouter } from 'next/router'
import Front from '../../components/Front'
import createGetServerSideProps from '../../lib/helpers/createGetServerSideProps'
import { FRONT_QUERY } from '../../components/Front/graphql/getFrontQuery.graphql'

const FRONT_PREVIEW_PATH = `/vorschau`

const FrontPreviewPage = () => {
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
    />
  )
}

export default FrontPreviewPage

export const getServerSideProps = createGetServerSideProps(
  async (client, params, user) => {
    await client.query({
      query: FRONT_QUERY,
      variables: {
        path: FRONT_PREVIEW_PATH,
        // first: finite ? 1000 : 15,
        first: 1000,
        // before: finite ? 'end' : undefined,
        before: 'end',
        only: params?.extractId,
      },
    })

    return {
      props: {},
    }
  },
)
