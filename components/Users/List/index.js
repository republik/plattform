import React, { Fragment } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import InfiniteScroller from 'react-infinite-scroller'
import { Loader } from '@project-r/styleguide'

import DateRange from '../../Form/DateRange'

import {
  serializeOrderBy,
  deserializeOrderBy,
  createChangeHandler
} from '../../Tables/utils'

import Table from './Table'
import TableForm from './TableForm'

const USERS_LIMIT = 200

const Users = props => {
  const {
    data,
    data: { users },
    params,
    loadMoreUsers,
    onChange
  } = props

  const changeHandler = createChangeHandler(
    params,
    onChange
  )

  return (
    <Fragment>
      <TableForm
        defaultSearch={params.search}
        onSearch={changeHandler('search')}
        dateRange={params.dateRange}
        onDateRange={changeHandler(
          'dateRange',
          DateRange.serialize
        )}
      />
      <Loader
        error={data.error}
        loading={data.loading}
        render={() => (
          <InfiniteScroller
            loadMore={loadMoreUsers}
            hasMore={users.count > users.items.length}
            useWindow={false}
          >
            <Table
              items={users.items}
              sort={deserializeOrderBy(params.orderBy)}
              onSort={changeHandler(
                'orderBy',
                serializeOrderBy
              )}
            />
          </InfiniteScroller>
        )}
      />
    </Fragment>
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
        username
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
                ...previousResult.users,
                ...fetchMoreResult.users,
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
