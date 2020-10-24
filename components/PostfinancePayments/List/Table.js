import React, { useState } from 'react'
import { css } from 'glamor'
import { Label } from '@project-r/styleguide'
import MessageForm from './MessageForm'
import { chfFormat } from '../../../lib/utils/formats'
import { displayDate } from '../../Display/utils'

import {
  tableStyles as styles,
  createSortHandler,
  createSortIndicator
} from '../../Tables/utils'

const Table = (
  {
    items,
    sort,
    onSort,
    onMessage,
    onMatch,
    onHide,
    ...props
  }
) => {
  const sortHandler = createSortHandler(sort || {}, onSort)
  const indicator = createSortIndicator(sort || {})
  return (
    <table {...props} {...styles.table}>
      <colgroup>
        <col style={{ width: '120px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '180px' }} />
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
            onClick={sortHandler('createdAt')}
          >
            <Label>Erstellt{indicator('createdAt')}</Label>
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
            onClick={sortHandler('konto')}
          >
            <Label>Konto{indicator('konto')}</Label>
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
            onClick={sortHandler('buchungsdatum')}
          >
            <Label>Buchungsdatum {indicator('buchungsdatum')}</Label>
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        {items.filter(v => v.hidden !== true).map(
          (postfinancePayment, index) => (
            <tr key={`postfinancePayment-${index}`} {...styles.row}>
              <td>{displayDate(postfinancePayment.createdAt)}</td>
              <td>{postfinancePayment.valuta}</td>
              <td>{postfinancePayment.konto}</td>
              <td>
                {postfinancePayment.avisierungstext}
                {postfinancePayment.image ? (
                  <Einzahlungsschein {...postfinancePayment}></Einzahlungsschein>
                ) : ''}
              </td>
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
              <td>{postfinancePayment.buchungsdatum}</td>
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
};

function Einzahlungsschein ({image}) {
  const [isSmall, setIsSmall] = useState(true)
  const size = isSmall ? 1 : 8
  const imgStyles = css({
    height: '2em',
    display: 'block',
    border: '1px solid black',
    borderColor: isSmall ? 'black' : 'transparent',
    transform: `scale(${size}, ${size})`
  })
  const linkStyle = css({
    display: 'block',
  })
  const onClick = (e) => {
    e.preventDefault()
    setIsSmall(!isSmall)
  }
  return (
    <a href="#" {...{onClick}}
      {...linkStyle}
    >
      <img src={'data:image/png;base64, ' + image} {...imgStyles}></img>
    </a>
  )
}

export default Table;
