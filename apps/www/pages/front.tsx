import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Front from '../components/Front'
import createGetStaticProps from '../lib/helpers/createGetStaticProps'
import { FRONT_QUERY } from '../components/Front/graphql/getFrontQuery.graphql'
import { useMe } from '../lib/context/MeContext'

const FRONT_PAGE_SSG_REVALIDATE = 60 // revalidate every minute
const FRONT_PATH = '/'

const FrontPage = () => {
  const router = useRouter()
  const { me, meLoading, hasActiveMembership } = useMe()

  useEffect(() => {
    if (meLoading) return
    // In case the user isn't logged in or has no active membership,
    // reload to re-trigger the middleware to rewrite to the marketing-page
    if (!me || !hasActiveMembership) {
      router.reload()
    }
  }, [me, meLoading, hasActiveMembership, router])

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
    // Throw error to fail build if the key is not defined
    if (!process.env.SSG_API_KEY) {
      throw new Error('Missing SSG_API_KEY environment variable')
    }

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

    return {
      props: {},
      revalidate: FRONT_PAGE_SSG_REVALIDATE,
    }
  },
  {
    authorization: `DocumentApiKey ${process.env.SSG_API_KEY}`,
  },
)
