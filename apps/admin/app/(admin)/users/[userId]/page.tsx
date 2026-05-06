import { Card } from '@/components/card'
import Actions from '@/components/Users/Actions'
import AdminNotes from '@/components/Users/AdminNotes'
import AuthSettings from '@/components/Users/AuthSettings'
import Links from '@/components/Users/Links'
import Mailbox from '@/components/Users/Mailbox'
import Roles from '@/components/Users/Roles'
import { UserDetails } from './user-details'

export default async function UserPage({ params }) {
  const { userId } = await params

  return (
    <>
      <Card>
        <UserDetails />
      </Card>
      <Card>
        <Roles userId={userId} />
        <Actions userId={userId} />
      </Card>
      <Card>
        <AuthSettings userId={userId} />
        <Mailbox userId={userId} narrow={3} />
        <Links userId={userId} />
        {/* @ts-expect-error not typed */}
        <AdminNotes userId={userId} />
      </Card>
    </>
  )
}
