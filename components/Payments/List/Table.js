import React from 'react'
import { Label, colors } from '@project-r/styleguide'
import { chfFormat } from '../../../lib/utils/formats'
import routes from '../../../server/routes'

import { displayDate } from '../../Display/utils'

import {
  tableStyles as styles,
  createSortHandler,
  createSortIndicator
} from '../../Tables/utils'

const { Link } = routes

const getDueDate = (
  status,
  dueDate
) => {
  if (!dueDate) {
    return '-'
  } else if (
    new Date(dueDate) < new Date() &&
    status !== 'PAID'
  ) {
    return (
      <span
        style={{
          color: colors.error,
          fontWeight: 'bold'
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
        <col style={{ width: '100px' }} />
        <col />
        <col />
        <col style={{ width: '150px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '180px' }} />
        <col style={{ maxWidth: '100px' }} />
      </colgroup>
      <thead>
        <tr {...styles.headRow}>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('hrid')}
          >
            <Label>HR-Nummer {indicator('hrid')}</Label>
          </th>
          <th
            {...styles.left}
          >
            <Label>Bezahlt von</Label>
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
            onClick={sortHandler('status')}
          >
            <Label>Status{indicator('status')}</Label>
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
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('createdAt')}
          >
            <Label>Erstellt{indicator('createdAt')}</Label>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((payment, index) => (
          <tr key={`payment-${index}`} {...styles.row}>
            <td>{payment.hrid}</td>
            <td>
              <Link
                route='user'
                params={{ userId: payment.user.id }}
              >
                <a {...styles.link}>
                  {payment.user.name || (`${payment.user.firstName} ${payment.user.lastName}`)}
                </a>
              </Link>
            </td>
            <td>{chfFormat(payment.total / 100)}</td>
            <td>{payment.status}</td>
            <td>{
              getDueDate(payment.status, payment.dueDate)
            }</td>
            <td>{payment.method}</td>
            <td>{displayDate(payment.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
};

export default Table;
