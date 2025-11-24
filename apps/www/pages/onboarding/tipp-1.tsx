import NewslettersOnboarding from '@app/components/onboarding/newsletters'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { withDefaultSSR } from '../../lib/apollo/helpers'
import { useMe } from '../../lib/context/MeContext'

function Page() {
  const { me } = useMe()
  const router = useRouter()
  useEffect(() => {
    if (!me) {
      router.push('/anmelden')
    }
  }, [me?.id])

  return <NewslettersOnboarding />
}

export default withDefaultSSR(Page)
