import * as React from 'react'
import { Table, Row, Cell } from '../Layout/Table'
import { colors } from '@project-r/styleguide'

const rowStyles = (index: number) => ({
  maxHeight: '40px',
  backgroundColor:
    index % 2 > 0 ? colors.secondaryBg : 'none'
})

const displayDate = (rawDate: string): string => {
  const date: Date = new Date(rawDate)
  return `${date.getDate()}.${date.getMonth() +
    1}.${date.getFullYear()}`
}

export default ({ items, ...props }: any) =>
  <Table {...props}>
    {items.map((user: any, index: number) =>
      <Row key={`user-${index}`} style={rowStyles(index)}>
        <Cell flex="0 0 40%">
          {user.email}
        </Cell>
        <Cell flex="0 0 25%">
          {user.firstName}
        </Cell>
        <Cell flex="0 0 25%">
          {user.lastName}
        </Cell>
        <Cell flex="0 0 10%">
          {displayDate(user.createdAt)}
        </Cell>
      </Row>
    )}
  </Table>
