import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'
import Onboarding from '../src/components/onboarding'

function Page() {
  const { me } = useMe()
  const router = useRouter()
  useEffect(() => {
    if (!me) {
      router.push('/anmelden')
    }
  }, [me?.id])

  return <Onboarding />
}

export default withDefaultSSR(Page)
