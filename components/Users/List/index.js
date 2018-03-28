import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ErrorMessage from '../../ErrorMessage'

import InfiniteScroller from 'react-infinite-scroller'

import TableForm from './TableForm'
import TableHead from './TableHead'
import TableBody from './TableBody'
import DateRange from '../../Form/DateRange'

import {
  serializeOrderBy,
  deserializeOrderBy
} from '../../../lib/utils/queryParams'

const USERS_LIMIT = 200

const identity = v => v

const createChangeHandler = (params, handler) => (
  fieldName: string,
  serializer?
) => value => {
  const s = serializer || identity
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

const Users = props => {
  if (props.data.error) {
    return <ErrorMessage error={props.data.error} />
  } else if (!props.data.users) {
    return <div>Loading</div>
  }
  const {
    data: { users: { items, count } },
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
  options: ({ params: { orderBy, dateRange, search } }) => {
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
  props: ({ data }) => ({
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
          previousResult,
          { fetchMoreResult }
        ) => {
          if (!fetchMoreResult) {
            return previousResult
          }
          return {
            ...previousResult,
            ...{
              users: {
                count: fetchMoreResult.users.count,
                items: [
                  ...previousResult.users.items,
                  ...fetchMoreResult.users.items
                ]
              }
            }
          }
        }
      })
    }
  })
})(Users)
