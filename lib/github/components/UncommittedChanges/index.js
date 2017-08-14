import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'

import { colors } from '@project-r/styleguide'

const styles = {
  list: css({
    listStyleType: 'none',
    margin: 0,
    maxHeight: '300px',
    overflow: 'scroll',
    padding: 0
  }),
  change: css({
    backgroundColor: colors.secondaryBg,
    borderBottom: `1px solid ${colors.divider}`,
    fontSize: '13px',
    padding: '5px',
    position: 'relative'
  })
}

const query = gql`
  query uncommittedChanges(
    $login: String!
    $repository: String!
    $filename: String!
  ) {
    repository(owner: $login, name: $repository) {
      uncommittedChanges(path: $filename) {
        id
        email
      }
    }
  }
`

const CHANGES_SUBSCRIPTION = gql`
  subscription onUncommitedChange(
    $login: String!
    $repository: String!
    $filename: String!
  ) {
    uncommittedChanges(
      login: $login
      repository: $repository
      path: $filename
    ) {
      action
      user {
        email
      }
    }
  }
`

class UncommittedChanges extends Component {
  componentWillMount () {
    this.props.subscribeToNewChanges()
  }

  render () {
    const { data: { loading, error, repository } } = this.props

    if (loading) {
      return <div>Loading</div>
    }
    if (error) {
      return (
        <div>
          {error}
        </div>
      )
    }
    let uncommittedChanges

    try {
      uncommittedChanges = repository.uncommittedChanges
    } catch (e) {}

    if (uncommittedChanges && uncommittedChanges.length) {
      return (
        <div>
          <ul {...styles.list}>
            {uncommittedChanges.map(change =>
              <li key={change.id} {...styles.change}>
                <a>
                  {change.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      )
    } else {
      return <div>No one</div>
    }
  }
}

export default graphql(query, {
  options: ({ login, repository, path }) => ({
    variables: {
      login,
      repository,
      filename: path.split('/').slice(1).join('/')
    }
  }),
  props: props => {
    return {
      ...props,
      subscribeToNewChanges: params => {
        return props.data.subscribeToMore({
          document: CHANGES_SUBSCRIPTION,
          variables: {
            login: props.data.variables.login,
            repository: props.data.variables.repository,
            filename: props.data.variables.filename
          },
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return prev
            }
            let action = subscriptionData.data.uncommittedChanges.action
            if (action === 'create') {
              const newChange = {
                // TODO: Use a better ID here (and unify initial with subscription model).
                id: subscriptionData.data.uncommittedChanges.user.email,
                email: subscriptionData.data.uncommittedChanges.user.email,
                __typename: 'User'
              }
              return Object.assign({}, prev, {
                repository: {
                  uncommittedChanges: [
                    newChange,
                    ...prev.repository.uncommittedChanges
                  ],
                  __typename: 'Repository'
                }
              })
            } else if (action === 'delete') {
              return Object.assign({}, prev, {
                repository: {
                  uncommittedChanges: [
                    ...prev.repository.uncommittedChanges.filter(
                      change =>
                        change.email !==
                        subscriptionData.data.uncommittedChanges.user.email
                    )
                  ]
                }
              })
            }
          }
        })
      }
    }
  }
})(UncommittedChanges)
