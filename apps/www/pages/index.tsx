import { useRouter } from 'next/router'
import Front from '../components/Front'
import { withDefaultSSR } from 'lib/apollo/helpers'

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
      documentPath={FRONT_PATH}
    />
  )
}

export default withDefaultSSR(FrontPage)
