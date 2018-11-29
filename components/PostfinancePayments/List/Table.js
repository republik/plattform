import React from 'react'
import { Label, colors } from '@project-r/styleguide'
import { css } from 'glamor'
import MessageForm from './MessageForm'

import { chfFormat } from '../../../lib/utils/formats'
import SortIndicator from '../../SortIndicator'

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

export default ({
  items,
  sort,
  onSort,
  onMessage,
  onMatch,
  onHide,
  ...props
}) => {
  const sortHandler = createSortHandler(sort || {}, onSort)
  const indicator = createIndicator(sort || {})
  return (
    <table {...props} {...styles.table}>
      <colgroup>
        <col style={{ width: '120px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '40%' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ maxWidth: '150px' }} />
      </colgroup>
      <thead>
        <tr {...styles.headRow}>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('buchungsdatum')}
          >
            <Label>Buchungsdatum {indicator('buchungsdatum')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('valuta')}
          >
            <Label>Valuta {indicator('valuta')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
          >
            <Label>Avisierungstext</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('gutschrift')}
          >
            <Label>Gutschrift{indicator('gutschrift')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
          >
            <Label>Mitteilung</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('matched')}
          >
            <Label>Matched{indicator('matched')}</Label>
          </th>
          <th
            {...styles.interactive}
            {...styles.left}
            onClick={sortHandler('createdAt')}
          >
            <Label>Erstellt{indicator('createdAt')}</Label>
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        {items.filter(v => v.hidden !== true).map(
          (postfinancePayment, index) => (
            <tr key={`postfinancePayment-${index}`} {...styles.row}>
              <td>{postfinancePayment.buchungsdatum}</td>
              <td>{postfinancePayment.valuta}</td>
              <td>{postfinancePayment.avisierungstext}</td>
              <td>{chfFormat(
                postfinancePayment.gutschrift /
                  100
              )}</td>
              <td>{
                !postfinancePayment.matched
                  ? <MessageForm
                    message={postfinancePayment.mitteilung}
                    onSubmit={(message) => onMessage({
                      id: postfinancePayment.id,
                      message
                    })}
                  />
                  : postfinancePayment.mitteilung
              }</td>
              <td>{postfinancePayment.matched ? 'Yes' : 'No'}</td>
              <td>{displayDate(postfinancePayment.createdAt)}</td>
              <td>{!postfinancePayment.matched && (
                <span>
                  <a
                    {...styles.link}
                    onClick={() => onHide({
                      id: postfinancePayment.id
                    })}
                  >
                    Verstecken
                  </a>
                  <br />
                  <a
                    {...styles.link}
                    onClick={() => onMatch({
                      id: postfinancePayment.id
                    })}
                  >
                    Matchen
                  </a>
                </span>
              )}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}
