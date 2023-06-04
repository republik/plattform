import { GetServerSideProps, NextPage } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Front from '../../components/Front'
import { FRONT_QUERY } from '../../components/Front/graphql/getFrontQuery.graphql'
import { createGetServerSideProps } from '../../lib/apollo/helpers'

function paramToString(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param
}

type Props = {
  extractId: string
}

const FrontPreviewPage: NextPage<Props> = ({ extractId }) => (
  <Front
    shouldAutoRefetch
    hasOverviewNav
    extractId={paramToString(extractId)}
    documentPath={'/'}
    finite
    renderBefore={undefined}
    renderAfter={undefined}
    containerStyle={undefined}
    serverContext={undefined}
  />
)

export default FrontPreviewPage

interface Params extends ParsedUrlQuery {
  extractId: string
}

export const getServerSideProps: GetServerSideProps = createGetServerSideProps<
  Props,
  Params
>(async ({ client, ctx: { params } }) => {
  const extractId = paramToString(params.extractId)

  await client.query({
    query: FRONT_QUERY,
    variables: {
      path: '/',
      only: extractId,
      first: 1000,
      before: 'end',
    },
  })

  return {
    props: {
      extractId,
    },
  }
})
