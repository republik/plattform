import * as React from 'react'
import { A, colors } from '@project-r/styleguide'
import { Table, Row, Cell } from '../../Layout/Table'
import MessageForm from './MessageForm'
import routes from '../../../routes'
const { Link } = routes

const displayDate = (rawDate: string): string => {
  const date: Date = new Date(rawDate)
  return `${date.getDate()}.${date.getMonth() +
    1}.${date.getFullYear()}`
}

const getDueDate = (status: string, dueDate?: string) => {
  if (!dueDate) {
    return '-'
  } else if (
    new Date(dueDate) < new Date() &&
    status !== 'PAID'
  ) {
    return (
      <span
        style={{ color: colors.error, fontWeight: 'bold' }}
      >
        {displayDate(dueDate)}
      </span>
    )
  }
  return displayDate(dueDate)
}

const rowStyles = (index: number) => ({
  maxHeight: '230px',
  padding: '10px 0',
  backgroundColor:
    index % 2 > 0 ? colors.secondaryBg : 'none'
})

const interactiveStyles = {
  cursor: 'pointer'
}

export default ({ items, ...props }: any) =>
  <Table {...props}>
    {items.map((postfinancePayment: any, index: number) =>
      <Row
        key={`postfinancePayment-${index}`}
        style={rowStyles(index)}
      >
        <Cell flex="0 0 10%">
          {postfinancePayment.buchungsdatum}
        </Cell>
        <Cell flex="0 0 10%">
          {postfinancePayment.valuta}
        </Cell>
        <Cell
          flex="0 0 30%"
          style={{ paddingRight: '10px' }}
        >
          {postfinancePayment.avisierungstext}
        </Cell>
        <Cell flex="0 0 10%">
          {postfinancePayment.gutschrift}
        </Cell>
        <Cell flex="0 0 10%">
          {!postfinancePayment.matched
            ? <MessageForm
                message={postfinancePayment.mitteilung}
                onSubmit={c => console.log(c)}
              />
            : postfinancePayment.mitteilung}
        </Cell>
        <Cell flex="0 0 10%">
          {postfinancePayment.matched ? 'Yes' : 'No'}
        </Cell>
        <Cell flex="0 0 10%">
          {displayDate(postfinancePayment.createdAt)}
        </Cell>
      </Row>
    )}
  </Table>
