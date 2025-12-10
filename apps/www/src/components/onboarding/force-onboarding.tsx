import { useMe } from 'lib/context/MeContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const ForceOnboarding = ({ children }) => {
  const { meLoading, me } = useMe()
  const router = useRouter()

  useEffect(() => {
    if (!meLoading && me && !me.onboarded) {
      router.push('/einrichten/Willkommen')
    }
  }, [meLoading, me, router])

  return <>{children}</>
}
