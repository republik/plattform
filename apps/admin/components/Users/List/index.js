import React, { Fragment } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import InfiniteScroller from 'react-infinite-scroller'

import { Loader, Interaction } from '@project-r/styleguide'

import {
  createChangeHandler
} from '../../Tables/utils'

import Table from './Table'
import TableForm from './TableForm'

const { P } = Interaction
const USERS_LIMIT = 100

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
      <TableForm defaultSearch={params.search} onSearch={changeHandler('search')} />
      <Loader
        error={data.error}
        loading={data.loading}
        render={() => (
          <InfiniteScroller
            loadMore={loadMoreUsers}
            hasMore={users.count > users.items.length}
            useWindow={false}
          >
            {users.count > 0 ? (
              <Table items={users.items} />
            ) : (
              <div style={{ padding: '1em' }}>
                <P>Nope. Njet. Nichts. Nada.</P>
                <P>Schon mal probiert, nach etwas Besserem zu suchen?</P>
              </div>
            )}
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
    $search: String
  ) {
    users: adminUsers(
      limit: $limit
      offset: $offset
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
        activeMembership {
          type {
            name
          }
        }
      }
    }
  }
`

export default graphql(usersQuery, {
  options: ({ params: { search } }) => {
    return {
      variables: {
        limit: USERS_LIMIT,
        offset: 0,
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
