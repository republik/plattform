import { css } from '@republik/theme/css'

import AdminNotes from '@/components/Users/AdminNotes'
import AuthSettings from '@/components/Users/AuthSettings'
import Roles from '@/components/Users/Roles'

import Actions from '@/components/Users/Actions'
import Links from '@/components/Users/Links'
import Mailbox from '@/components/Users/Mailbox'
import { UserDetails } from './user-details'
import { Card } from '@/components/card'

const styles = {
  grid: css({
    display: 'grid',
    gridTemplateColumns: '[repeat(auto-fit, minmax(300px, 1fr))]',
  }),
  span1: css({
    gridColumn: '[span 1]',
  }),
  span2: css({
    gridColumn: '[span 2]',
  }),
}

export default async function UserPage({ params }) {
  const { userId } = await params

  return (
    <>
      <Card>
        <UserDetails userId={userId} />
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
