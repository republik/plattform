import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import { useRouter } from 'next/router'
import Front from '../components/Front'

const FrontPage = () => {
  const router = useRouter()
  return (
    <Front
      shouldAutoRefetch
      hasOverviewNav
      extractId={router.query.extractId}
      finite
    />
  )
}

export default withDefaultSSR(FrontPage)
