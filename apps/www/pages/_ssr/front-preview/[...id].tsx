import { GetServerSideProps, NextPage } from 'next'
import { ParsedUrlQuery } from 'querystring'
import createGetServerSideProps from '../../../lib/helpers/createGetServerSideProps'
import Front from '../../../components/Front'
import { FRONT_QUERY } from '../../../components/Front/graphql/getFrontQuery.graphql'
import { errorToString } from '../../../lib/utils/errors'

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
>(async (client, params) => {
  try {
    const data = await client.query({
      query: FRONT_QUERY,
      variables: {
        path: '/',
        only: Array.isArray(params.id) ? params.id[0] : params.id,
        // first: finite ? 1000 : 15,
        first: 1000,
        // before: finite ? 'end' : undefined,
        before: 'end',
      },
    })

    console.log('data', JSON.stringify(data, null, 2))

    return {
      props: {
        id: params.id,
      },
    }
  } catch (error) {
    console.error(errorToString(error), params.id)
    return {
      notFound: true,
    }
  }
})
