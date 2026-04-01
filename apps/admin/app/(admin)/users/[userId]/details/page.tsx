'use client'
import { Card, CardTitle } from '@/components/card'
import { useUserProfileData } from '../use-user-profile-data'
import { EditUserDetails } from '../user-details'
import { EditUserEmail } from '../user-email'

export default function SubscriptionsPage() {
  const user = useUserProfileData()

  if (!user) return null

  return (
    <>
      <Card>
        <CardTitle>E-Mail</CardTitle>
        <EditUserEmail userId={user.id} email={user.email} />
      </Card>
      <Card>
        <CardTitle>Personalien</CardTitle>
        <EditUserDetails userId={user.id} values={user} />
      </Card>
    </>
  )
}
