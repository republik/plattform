'use client'
import { Card, CardTitle } from '@/components/card'
import { EditUserRoles } from '../user-roles'
import { useUserProfileData } from '../use-user-profile-data'

export default function SubscriptionsPage() {
  const user = useUserProfileData()

  if (!user) return null

  return (
    <>
      <Card>
        <CardTitle>Rollen</CardTitle>
        <EditUserRoles userId={user.id} roles={user.roles} />
      </Card>
    </>
  )
}
