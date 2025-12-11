import Onboarding from '../components/Onboarding/Page'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

function EinrichtenPage() {
  const { me } = useMe()
  const router = useRouter()
  useEffect(() => {
    if (!me) {
      router.push('/anmelden')
    }
  }, [me?.id])

  return <Onboarding />
}

export default withDefaultSSR(EinrichtenPage)
