import { displayDate } from '@/components/Display/utils'
import { tableStyles as styles } from '@/components/Tables/utils'
import { Label } from '@project-r/styleguide'
import Link from 'next/link'

const Table = ({ items, ...props }) => {
  return (
    <table {...props} className={styles.table}>
      <colgroup>
        <col />
        <col style={{ width: '20%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ maxWidth: '90px' }} />
        <col style={{ maxWidth: '100px' }} />
      </colgroup>
      <thead>
        <tr className={styles.headRow}>
          <th className={styles.left}>
            <Label>Email</Label>
          </th>
          <th className={styles.left}>
            <Label>First name</Label>
          </th>
          <th className={styles.left}>
            <Label>Last name</Label>
          </th>
          <th>
            <Label>Active Membership</Label>
          </th>
          <th>
            <Label>Created</Label>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((user) => (
          <tr key={`user-${user.id}`} className={styles.row}>
            <td>
              <Link href={`/users/${user.id}`} className={styles.link}>
                {user.email}
              </Link>
            </td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td className={styles.center}>
              {user.activeMembership?.type?.name ??
                user.activeMagazineSubscription?.type}
            </td>
            <td className={styles.center}>{displayDate(user.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
