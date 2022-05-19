import { GetServerSideProps, NextPage } from 'next'
import { ParsedUrlQuery } from 'querystring'
import createGetServerSideProps from '../../../lib/helpers/createGetServerSideProps'
import Front from '../../../components/Front'
import { FRONT_QUERY } from '../../../components/Front/graphql/getFrontQuery.graphql'

type Props = {
  id: string | string[]
}

const FrontPreviewPage: NextPage<Props> = ({ id }) => (
  <Front
    shouldAutoRefetch
    hasOverviewNav
    extractId={Array.isArray(id) ? id[0] : id}
    documentPath={'/'}
    finite
    // Thank you very much legacy component :)
    renderBefore={undefined}
    renderAfter={undefined}
    containerStyle={undefined}
    serverContext={undefined}
    isEditor={undefined}
  />
)

export default FrontPreviewPage

interface Params extends ParsedUrlQuery {
  id: string | string[]
}

// Caching is done by asset-server, therefore caching via SSG or ISR would be unnecessary
export const getServerSideProps: GetServerSideProps = createGetServerSideProps<
  unknown,
  Params
>(async (client, params, _, ctx) => {
  await client.query({
    query: FRONT_QUERY,
    variables: {
      path: '/',
      only: Array.isArray(params.id) ? params.id[0] : params.id,
      first: 1000,
      before: 'end',
    },
  })

  return {
    props: {
      id: params.id,
    },
  }
})
