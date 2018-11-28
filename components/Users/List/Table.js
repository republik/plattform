import React from 'react'
import { Label, colors } from '@project-r/styleguide'
import { css } from 'glamor'
import routes from '../../../server/routes'
import SortIndicator from '../../SortIndicator'

const { Link } = routes
const styles = {
  table: css({
    width: '100%',
    borderSpacing: 0
  }),
  link: css({
    textDecoration: 'none',
    color: colors.primary,
    ':visited': {
      color: colors.primary
    },
    ':hover': {
      color: colors.secondary
    },
    cursor: 'pointer'
  }),
  row: css({
    height: '35px',
    '&:nth-child(even)': {
      backgroundColor: colors.secondaryBg
    }
  }),
  headRow: css({
    height: '40px',
    backgroundColor: '#fff',
    '&:nth-child(1) th': {
      borderBottom: `1px solid ${colors.divider}`,
      background: 'white',
      position: 'sticky',
      top: -20,
      zIndex: 10
    }
  }),
  left: css({
    textAlign: 'left'
  }),
  right: css({
    textAlign: 'right'
  }),
  center: css({
    textAlign: 'center'
  })
}

const displayDate = rawDate => {
  const date = new Date(rawDate)
  return `${date.getDate()}.${date.getMonth() +
    1}.${date.getFullYear()}`
}

const createSortHandler = (
  sort,
  handler
) => fieldName => () => {
  if (sort.field !== fieldName) {
    return handler({
      field: fieldName,
      direction: 'ASC'
    })
  } else {
    return handler({
      field: sort.field,
      direction: sort.direction === 'ASC' ? 'DESC' : 'ASC'
    })
  }
}

const createIndicator = sort => fieldName => {
  if (sort.field === fieldName) {
    return <SortIndicator sortDirection={sort.direction} />
  } else {
    return null
  }
}

export default ({ items, sort, onSort, ...props }) => {
  const sortHandler = createSortHandler(sort || {}, onSort)
  const indicator = createIndicator(sort || {})
  return (
    <table {...props} {...styles.table}>
      <colgroup>
        <col />
        <col style={{width: '20%'}} />
        <col style={{width: '20%'}} />
        <col style={{maxWidth: '90px'}} />
        <col style={{maxWidth: '100px'}} />
      </colgroup>
      <thead>
        <tr {...styles.headRow}>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('email')}
          >
            <Label>Email {indicator('email')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('firstName')}
          >
            <Label>First name{indicator('firstName')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('lastName')}
          >
            <Label>Last name{indicator('lastName')}</Label>
          </th>
          <th
            {...styles.interactive}
            onClick={sortHandler('createdAt')}
          >
            <Label>Created{indicator('createdAt')}</Label>
          </th>
          <th>
            <Label>Options</Label>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((user, index) => (
          <tr key={`user-${index}`} {...styles.row}>
            <td>{user.email}</td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td {...styles.center}>{displayDate(user.createdAt)}</td>
            <td {...styles.center}>
              <Link
                route='user'
                params={{ userId: user.id }}
              >
                <a {...styles.link}>
                Details
              </a>
              </Link>
            </td>
          </tr>
      ))}
      </tbody>
    </table>
  )
}
