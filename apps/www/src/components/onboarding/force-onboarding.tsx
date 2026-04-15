import { useMe } from 'lib/context/MeContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const ForceOnboarding = ({ children }) => {
  const { me, hasActiveMembership } = useMe()
  const router = useRouter()

  const notOnboardedMember = me && !me.onboarded && hasActiveMembership

  useEffect(() => {
    if (notOnboardedMember) {
      router.push('/einrichten/willkommen')
    }
  }, [notOnboardedMember, router])

  return <>{children}</>
}
