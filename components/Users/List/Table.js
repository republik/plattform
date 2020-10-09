import React from 'react'

import { Label } from '@project-r/styleguide'

import { Link } from '../../../server/routes'
import { displayDate } from '../../Display/utils'
import { tableStyles as styles } from '../../Tables/utils'

const Table = ({ items,...props }) => {
  return (
    <table {...props} {...styles.table}>
      <colgroup>
        <col />
        <col style={{ width: '20%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ maxWidth: '90px' }} />
        <col style={{ maxWidth: '100px' }} />
      </colgroup>
      <thead>
        <tr {...styles.headRow}>
          <th {...styles.left}>
            <Label>Email</Label>
          </th>
          <th {...styles.left}>
            <Label>First name</Label>
          </th>
          <th {...styles.left}>
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
          <tr key={`user-${user.id}`} {...styles.row}>
            <td>
              <Link route='user' params={{ userId: user.id }}>
                <a {...styles.link}>
                  {user.email}
                </a>
              </Link>
            </td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td {...styles.center}>{user.activeMembership && user.activeMembership.type.name}</td>
            <td {...styles.center}>{displayDate(user.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
};

export default Table;
