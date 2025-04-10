import { useEffect, useState } from 'react'
import Paywall from '../../components/Paywall'
import { trackArticleRead, hasExceededThreshold } from '../../utils/paywall'

const FREE_ARTICLE_LIMIT = 5

export default function ArticlePage({ articleId }: { articleId: string }) {
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    trackArticleRead(articleId)
    if (hasExceededThreshold(FREE_ARTICLE_LIMIT)) {
      setShowPaywall(true)
    }
  }, [articleId])

  if (showPaywall) {
    return (
      <Paywall onSubscribe={() => alert('Redirect to subscription page')} />
    )
  }

  return <div>{/* Render article content */}</div>
}
