import { css } from '@republik/theme/css'

import AdminNotes from '@/components/Users/AdminNotes'
import AuthSettings from '@/components/Users/AuthSettings'
import Email from '@/components/Users/Email'
import User from '@/components/Users/Particulars'
import Roles from '@/components/Users/Roles'

import Actions from '@/components/Users/Actions'
import Links from '@/components/Users/Links'
import Mailbox from '@/components/Users/Mailbox'
import { UserEmail } from './user-email'

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
    <div className={styles.grid}>
      <div className={styles.span1}>
        <User userId={userId} />

        <UserEmail userId={userId} />
      </div>
      <div className={styles.span1}>
        <Roles userId={userId} />
        <Actions userId={userId} />
      </div>
      <div className={styles.span2}>
        <AuthSettings userId={userId} />
        <Mailbox userId={userId} narrow={3} />
        <Links userId={userId} />
        {/* @ts-expect-error not typed */}
        <AdminNotes userId={userId} />
      </div>
    </div>
  )
}
