import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import * as InfiniteScroller from 'react-infinite-scroller'
import { css, StyleAttribute } from 'glamor'
import { User } from '../../../types/admin'

import TableForm from './TableForm'
import TableHead from './TableHead'
import TableBody from './TableBody'

export interface UsersResult {
  users: {
    items: User[]
    count: number
  }
}

export interface UserTableParams {
  orderBy?: string
  search?: string
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

type SortDirection = 'ASC' | 'DESC'
interface SortOptions {
  sortBy?: string
  sortDirection?: SortDirection
}

const USERS_LIMIT = 200

const createChangeHandler = (
  params: any,
  handler: (v: any) => void
) => (fieldName: string) => (value: string) => {
  if (value && value !== '') {
    handler({
      ...params,
      ...{ [fieldName]: value }
    })
  } else {
    delete params[fieldName]
    handler(params)
  }
}

const Users = (props: Props) => {
  if (!props.data.users) {
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
        />
        <TableHead
          sort={params.orderBy}
          onSort={changeHandler('orderBy')}
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
    $orderBy: String
    $search: String
  ) {
    users(
      limit: $limit
      offset: $offset
      orderBy: $orderBy
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
  options: ({ params: { orderBy, search } }: OwnProps) => {
    return {
      variables: {
        limit: USERS_LIMIT,
        offset: 0,
        orderBy,
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
