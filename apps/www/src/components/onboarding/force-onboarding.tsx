import { useMe } from 'lib/context/MeContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const ForceOnboarding = ({ children }) => {
  const { me } = useMe()
  const router = useRouter()

  const notOnboarded = me && !me.onboarded

  useEffect(() => {
    if (notOnboarded) {
      router.push('/einrichten/willkommen')
    }
  }, [notOnboarded, router])

  return <>{children}</>
}
