import * as React from 'react'
import { Table, Row, Cell } from '../../Layout/Table'
import * as Sticky from 'react-sticky-el'
import { Label, colors } from '@project-r/styleguide'
import SortIndicator from '../../SortIndicator'
import {
  SortOptions,
  SortDirection
} from '../../../lib/utils/queryParams'

export interface HeadProps {
  [key: string]: any
  onSort: (value: SortOptions) => void
  sort?: SortOptions
}

const rowStyles = {
  maxHeight: '40px',
  backgroundColor: '#fff',
  borderBottom: `1px solid ${colors.divider}`
}

const interactiveStyles = {
  cursor: 'pointer'
}

const createSortHandler = (
  sort: SortOptions,
  handler: (value: SortOptions) => void
) => (fieldName: string) => () => {
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

const createIndicator = (sort: SortOptions) => (
  fieldName: string
) => {
  if (sort.field === fieldName) {
    return <SortIndicator sortDirection={sort.direction} />
  } else {
    return null
  }
}

export default ({ sort, onSort, ...props }: HeadProps) => {
  const sortHandler = createSortHandler(sort || {}, onSort)
  const indicator = createIndicator(sort || {})

  return (
    <Sticky scrollElement="#content" {...props}>
      <Table>
        <Row style={rowStyles}>
          <Cell
            flex="0 0 40%"
            style={interactiveStyles}
            onClick={sortHandler('email')}
          >
            <Label>
              Email {indicator('email')}
            </Label>
          </Cell>
          <Cell
            flex="0 0 20%"
            style={interactiveStyles}
            onClick={sortHandler('firstName')}
          >
            <Label>
              First name{indicator('firstName')}
            </Label>
          </Cell>
          <Cell
            flex="0 0 20%"
            style={interactiveStyles}
            onClick={sortHandler('lastName')}
          >
            <Label>
              Last name{indicator('lastName')}
            </Label>
          </Cell>
          <Cell
            flex="0 0 10%"
            style={interactiveStyles}
            onClick={sortHandler('createdAt')}
          >
            <Label>
              Created{indicator('createdAt')}
            </Label>
          </Cell>
          <Cell flex="0 0 10%">
            <Label>Details</Label>
          </Cell>
        </Row>
      </Table>
    </Sticky>
  )
}
