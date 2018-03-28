import React from 'react'
import { Table, Row, Cell } from '../../Layout/Table'
import { colors, Label } from '@project-r/styleguide'

const rowStyles = index => ({
  maxHeight: '40px',
  backgroundColor:
    index % 2 > 0 ? colors.secondaryBg : 'none'
})

const headStyles = {
  maxHeight: '40px',
  backgroundColor: '#fff',
  borderBottom: `1px solid ${colors.divider}`
}

const displayDate = rawDate => {
  const date = new Date(rawDate)
  return `${date.getDate()}.${date.getMonth() +
    1}.${date.getFullYear()}`
}

export default ({ items, ...props }) => (
  <Table {...props}>
    <Row style={headStyles}>
      <Cell flex="0 0 15%">
        <Label>Action</Label>
      </Cell>
      <Cell flex="0 0 15%">
        <Label>Date</Label>
      </Cell>
      <Cell flex="0 0 20%">
        <Label>E-Mail</Label>
      </Cell>
      <Cell flex="0 0 40%">
        <Label>User Agent</Label>
      </Cell>
      <Cell flex="0 0 10%">
        <Label>Current session</Label>
      </Cell>
    </Row>
    {items.map((entry, index) => (
      <Row key={`user-${index}`} style={rowStyles(index)}>
        <Cell flex="0 0 15%">
          {entry.type.split('_').join(' ')}
        </Cell>
        <Cell flex="0 0 15%">
          {displayDate(entry.createdAt)}
        </Cell>
        <Cell flex="0 0 20%">
          {entry.archivedSession.email}
        </Cell>
        <Cell flex="0 0 40%">
          {entry.archivedSession.userAgent}
        </Cell>
        <Cell flex="0 0 10%">
          {' '}
          {entry.activeSession &&
          entry.activeSession.isCurrent
            ? 'YES'
            : 'NO'}
        </Cell>
      </Row>
    ))}
  </Table>
)
