import { Label } from '@project-r/styleguide'
import Link from 'next/link'
import { chfFormat } from '../../../lib/utils/formats'

import { displayDate } from '../../Display/utils'

import {
  tableStyles as styles,
  createSortHandler,
  createSortIndicator,
} from '../../Tables/utils'

const getDueDate = (status, dueDate) => {
  if (!dueDate) {
    return ''
  } else if (new Date(dueDate) < new Date() && status !== 'PAID') {
    return (
      <span
        style={{
          color: 'var(--color-error)',
        }}
      >
        {displayDate(dueDate)}
      </span>
    )
  }
  return displayDate(dueDate)
}

const Table = ({ items, sort, onSort, ...props }) => {
  const sortHandler = createSortHandler(sort || {}, onSort)
  const indicator = createSortIndicator(sort || {})
  return (
    <table {...props} {...styles.table}>
      <colgroup>
        <col style={{ width: '120px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '180px' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '25%' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '100px' }} />
      </colgroup>
      <thead>
        <tr {...styles.headRow}>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('createdAt')}
          >
            <Label>Erstellt{indicator('createdAt')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('dueDate')}
          >
            <Label>Fälligkeit{indicator('dueDate')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('method')}
          >
            <Label>Zahlungsart{indicator('method')}</Label>
          </th>
          <th {...styles.left}>
            <Label>Name</Label>
          </th>
          <th {...styles.left}>
            <Label>Anschrift</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('total')}
          >
            <Label>Total{indicator('total')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('hrid')}
          >
            <Label>HR-Nummer {indicator('hrid')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('status')}
          >
            <Label>Status{indicator('status')}</Label>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((payment, index) => {
          const {
            user,
            user: { address },
          } = payment

          const name = user.name || `${user.firstName} ${user.lastName}`

          return (
            <tr key={`payment-${index}`} {...styles.row}>
              <td>{displayDate(payment.createdAt)}</td>
              <td>{getDueDate(payment.status, payment.dueDate)}</td>
              <td>{payment.method}</td>
              <td>
                <Link href={`/users/${user.id}`}>
                  <a {...styles.link}>{name}</a>
                </Link>
              </td>
              <td>
                {address &&
                  [
                    name !== address.name && address.name,
                    address.line1,
                    address.line2,
                    [address.postalCode, address.city].join(' ').trim(),
                  ]
                    .filter(Boolean)
                    .map((string) => string.trim())
                    .join(', ')}
              </td>
              <td>{chfFormat(payment.total / 100)}</td>
              <td>{payment.hrid}</td>
              <td>{payment.status}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default Table
