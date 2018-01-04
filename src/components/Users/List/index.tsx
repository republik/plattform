import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import ErrorMessage from '../../ErrorMessage'

import * as InfiniteScroller from 'react-infinite-scroller'
import { css, StyleAttribute } from 'glamor'
import { User } from '../../../types/admin'

import TableForm from './TableForm'
import TableHead from './TableHead'
import TableBody from './TableBody'
import * as DateRange from '../../Form/DateRange'

import {
  SortOptions,
  SortDirection,
  serializeOrderBy,
  deserializeOrderBy
} from '../../../lib/utils/queryParams'

export interface UsersResult {
  users: {
    items: User[]
    count: number
  }
}

interface OwnProps {
  [prop: string]: any
  loadMoreUsers?: any
  params: any
  onChange: (...args: any[]) => void
}

interface Props extends OwnProps {
  data: QueryProps & UsersResult
}

const USERS_LIMIT = 200

const identity = (v: any) => v

const createChangeHandler = (
  params: any,
  handler: (v: any) => void
) => (fieldName: string, serializer?: any) => (
  value: any
) => {
  const s: any = serializer || identity
  if (value && value !== '' && Object.keys(value)) {
    handler({
      ...params,
      ...{ [fieldName]: s(value) }
    })
  } else {
    delete params[fieldName]
    handler(params)
  }
}

const Users = (props: Props) => {
  if (props.data.error) {
    return <ErrorMessage error={props.data.error} />
  } else if (!props.data.users) {
    return <div>Loading</div>
  }
  const {
    data: { users: { items, count }, loading },
    params,
    loadMoreUsers,
    onChange
  } = props

  const changeHandler = createChangeHandler(
    params,
    onChange
  )

  return (
    <InfiniteScroller
      loadMore={loadMoreUsers}
      hasMore={count > items.length}
      useWindow={false}
    >
      <div>
        <TableForm
          search={params.search}
          onSearch={changeHandler('search')}
          dateRange={params.dateRange}
          onDateRange={changeHandler(
            'dateRange',
            DateRange.serialize
          )}
        />
        <TableHead
          sort={deserializeOrderBy(params.orderBy)}
          onSort={changeHandler(
            'orderBy',
            serializeOrderBy
          )}
        />
        <TableBody items={items} />
      </div>
    </InfiniteScroller>
  )
}

const usersQuery = gql`
  query users(
    $limit: Int!
    $offset: Int
    $orderBy: OrderBy
    $search: String
    $dateRange: DateRangeFilter
  ) {
    users: adminUsers(
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      dateRangeFilter: $dateRange
      search: $search
    ) {
      count
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

export default graphql(usersQuery, {
  options: ({
    params: { orderBy, dateRange, search }
  }: OwnProps) => {
    return {
      variables: {
        limit: USERS_LIMIT,
        offset: 0,
        orderBy: deserializeOrderBy(orderBy),
        dateRange: DateRange.parse(dateRange),
        search
      }
    }
  },
  props: ({
    data
  }: OptionProps<OwnProps, UsersResult>) => ({
    data,
    loadMoreUsers: () => {
      if (!data) {
        throw new Error('data object undefined')
      }
      return data.fetchMore({
        variables: {
          offset: data.users.items.length
        },
        updateQuery: (
          previousResult: UsersResult,
          { fetchMoreResult }
        ) => {
          if (!fetchMoreResult) {
            return previousResult
          }
          return {
            ...previousResult,
            ...{
              users: {
                items: [
                  ...previousResult.users.items,
                  ...(fetchMoreResult as UsersResult).users
                    .items
                ]
              }
            }
          }
        }
      })
    }
  })
})(Users)
