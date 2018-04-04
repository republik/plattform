import React from 'react'
import {
  Table,
  Row,
  Cell
} from '../../Layout/Table'
import { colors } from '@project-r/styleguide'
import { css } from 'glamor'
import routes from '../../../server/routes'
const { Link } = routes

const rowStyles = (index: number) => ({
  maxHeight: '40px',
  backgroundColor:
    index % 2 > 0 ? colors.secondaryBg : 'none'
})

const displayDate = rawDate => {
  const date = new Date(rawDate)
  return `${date.getDate()}.${date.getMonth() +
    1}.${date.getFullYear()}`
}

const interactiveStyles = {
  cursor: 'pointer'
}

const link = css({
  textDecoration: 'none',
  color: colors.primary,
  ':visited': {
    color: colors.primary
  },
  ':hover': {
    color: colors.secondary
  }
})

export default ({ items, ...props }) => (
  <Table {...props}>
    {items.map((user, index: number) => (
      <Row
        key={`user-${index}`}
        style={rowStyles(index)}
      >
        <Cell flex="0 0 40%">{user.email}</Cell>
        <Cell flex="0 0 20%">
          {user.firstName}
        </Cell>
        <Cell flex="0 0 20%">
          {user.lastName}
        </Cell>
        <Cell flex="0 0 10%">
          {displayDate(user.createdAt)}
        </Cell>
        <Cell flex="0 0 10%">
          <Link
            route="user"
            params={{ userId: user.id }}
          >
            <a
              className={`${link}`}
              style={interactiveStyles}
            >
              Details
            </a>
          </Link>
        </Cell>
      </Row>
    ))}
  </Table>
)
