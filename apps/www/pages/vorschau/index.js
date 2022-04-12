import Front from '../../components/Front'
import { useRouter } from 'next/router'
import withDefaultSSR from '../../lib/hocs/withDefaultSSR'

const FrontPreviewPage = ({ serverContext }) => {
  const router = useRouter()

  return (
    <Front
      shouldAutoRefetch
      hasOverviewNav
      extractId={router.query.extractId}
      finite
      serverContext={serverContext}
      isPreview
    />
  )
}

export default withDefaultSSR(FrontPreviewPage)
