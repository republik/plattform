import * as React from 'react'
import { gql, graphql, OptionProps, QueryProps } from 'react-apollo'
import { css, StyleAttribute } from 'glamor'
import {
  WindowScroller,
  InfiniteLoader,
  AutoSizer,
  Table,
  Column
} from 'react-virtualized'

import { User, UsersResult, UserParams } from '../types/users'

interface OwnProps {
  [prop: string]: any
  loadMoreUsers?: any
  params: UserParams
  onChange: (params: UserParams, previousParams: UserParams) => void
}

interface Props extends OwnProps {
  data: QueryProps & UsersResult
}

type SortDirection = 'ASC' | 'DESC'
interface SortOptions {
  sortBy?: string
  sortDirection?: SortDirection
}

const USERS_LIMIT = 200

const scrollContainerStyles: StyleAttribute = css({
  flex: '1 1 auto'
})

const gridStyles: StyleAttribute = css({
  outline: 'none'
})

const rowStyles: StyleAttribute = css({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row'
})

const rowGetter = (list: User[]) => ({ index }: { index: number }): User =>
  list[index]

const isRowLoaded = (list: User[]) => ({
  index
}: {
  index: number
}): boolean => {
  return !!list[index]
}

const deserializeOrderBy = (str?: string): SortOptions => {
  if (!str) {
    return {}
  }
  const [field, direction] = str.split(':')
  return {
    sortBy: field.toString(),
    sortDirection: direction.toUpperCase() as SortDirection
  }
}

const serializeOrderBy = ({ sortBy, sortDirection }: SortOptions): string =>
  `${sortBy}:${sortDirection && sortDirection.toLowerCase()}`

const createSortHandler = (props: OwnProps) => (sortOptions: SortOptions) =>
  props.onChange(
    {
      ...props.params,
      ...{ orderBy: serializeOrderBy(sortOptions) }
    },
    props.params
  )

const UserList = ({
  data: { users: { items, meta }, loading },
  params: { orderBy },
  loadMoreUsers
}: Props) => {
  if (items && items.length) {
    const { sortBy, sortDirection } = deserializeOrderBy(orderBy)
    return (
      <div className={`${scrollContainerStyles}`}>
        <WindowScroller>
          {({ height, isScrolling, onChildScroll, scrollTop }: any) =>
            <InfiniteLoader
              isRowLoaded={isRowLoaded(items)}
              loadMoreRows={loadMoreUsers}
              rowCount={meta.count}
            >
              {({ onRowsRendered, registerChild }) =>
                <AutoSizer disableHeight>
                  {({ width }) => {
                    return (
                      <Table
                        rowGetter={rowGetter(items)}
                        width={width}
                        height={height}
                        isScrolling={isScrolling}
                        onScroll={onChildScroll}
                        scrollTop={scrollTop}
                        headerHeight={20}
                        onRowsRendered={onRowsRendered}
                        ref={registerChild}
                        rowHeight={30}
                        rowCount={items.length}
                        rowClassName={`${rowStyles}`}
                        gridClassName={`${gridStyles}`}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                      >
                        <Column
                          label="E-Mail"
                          cellDataGetter={({ rowData }) => rowData.email}
                          dataKey="email"
                          width={400}
                        />
                        <Column
                          label="First name"
                          cellDataGetter={({ rowData }) => rowData.firstName}
                          dataKey="firstName"
                          width={150}
                        />
                        <Column
                          label="Last name"
                          cellDataGetter={({ rowData }) => rowData.lastName}
                          dataKey="lastName"
                          width={150}
                        />
                        <Column
                          label="Created"
                          cellDataGetter={({ rowData }) => {
                            const date: Date = new Date(rowData.createdAt)
                            return `${date.getDate()}.${date.getMonth() +
                              1}.${date.getFullYear()}`
                          }}
                          dataKey="createdAt"
                          width={200}
                        />
                      </Table>
                    )
                  }}
                </AutoSizer>}
            </InfiniteLoader>}
        </WindowScroller>
      </div>
    )
  }
  return <div>Loading</div>
}

const users = gql`
  query users($limit: Int!, $offset: Int, $orderBy: String) {
    users(limit: $limit, offset: $offset, orderBy: $orderBy) {
      meta {
        count
      }
      items {
        id
        name
        email
        firstName
        lastName
        createdAt
        updatedAt
      }
    }
  }
`

export default graphql(users, {
  options: ({ params: { orderBy } }: OwnProps) => {
    return {
      variables: {
        limit: USERS_LIMIT,
        offset: 0,
        orderBy
      }
    }
  },
  props: ({ data }: OptionProps<OwnProps, UsersResult>) => ({
    data,
    loadMoreUsers: () => {
      if (!data) {
        throw new Error('data object undefined')
      }
      return data.fetchMore({
        variables: {
          offset: data.users.items.length
        },
        updateQuery: (previousResult: UsersResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult
          }
          return {
            ...previousResult,
            ...{
              users: {
                items: [
                  ...previousResult.users.items,
                  ...(fetchMoreResult as UsersResult).users.items
                ]
              }
            }
          }
        }
      })
    }
  })
})(UserList)
