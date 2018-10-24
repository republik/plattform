import React, { Fragment } from 'react'
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

import { Loader } from '@project-r/styleguide'

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
      <TableHead
        sort={deserializeOrderBy(params.orderBy)}
        onSort={changeHandler(
          'orderBy',
          serializeOrderBy
        )}
      />
      <Loader
        error={data.error}
        loading={data.loading}
        render={() => <Fragment>
          <InfiniteScroller
            loadMore={loadMoreUsers}
            hasMore={users.count > users.items.length}
            useWindow={false}
          >
            <TableBody items={users.items} />
          </InfiniteScroller>
        </Fragment>} />
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
