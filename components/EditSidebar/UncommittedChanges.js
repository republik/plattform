import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'
import Loader from '../../components/Loader'

const styles = {
  list: css({
    listStyleType: 'none',
    margin: 0,
    maxHeight: '300px',
    overflow: 'scroll',
    padding: 0
  }),
  change: css({
    borderBottom: `1px solid ${colors.divider}`,
    fontSize: '11px',
    padding: '5px 0',
    position: 'relative'
  }),
  empty: css({
    fontSize: '13px',
    padding: '10px',
    textAlign: 'center'
  })
}

const query = gql`
  query repo($repoId: ID!) {
    repo(id: $repoId) {
      id
      uncommittedChanges {
        id
        email
      }
    }
  }
`

const uncommittedChangesSubscription = gql`
  subscription onUncommitedChange(
    $repoId: ID!
  ) {
    uncommittedChanges(
      repoId: $repoId
    ) {
      repoId
      action
      user {
        id
        email
      }
    }
  }
`

class UncommittedChanges extends Component {
  componentDidMount () {
    this.unsubscribe = this.props.subscribeToNewChanges()
  }

  componentWillUnmount () {
    this.unsubscribe && this.unsubscribe()
  }

  render () {
    const { loading, error, data } = this.props

    return (
      <Loader loading={loading} error={error} render={() => (
        <div>
          {!!data.repo.uncommittedChanges.length &&
          <ul {...styles.list}>
            {data.repo.uncommittedChanges.map(change =>
              <li key={change.id} {...styles.change}>
                {change.email}
              </li>
            )}
          </ul>}
          {!data.repo.uncommittedChanges.length &&
          <div {...styles.empty}>No one!</div>}
        </div>
      )} />
    )
  }
}

export default graphql(query, {
  options: ({ repoId }) => ({
    variables: {
      repoId: repoId
    }
  }),
  props: props => {
    return {
      ...props,
      subscribeToNewChanges: params => {
        return props.data.subscribeToMore({
          document: uncommittedChangesSubscription,
          variables: {
            repoId: props.data.repo.id
          },
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return prev
            }
            let action = subscriptionData.data.uncommittedChanges.action
            if (action === 'create') {
              const newChange = {
                id: subscriptionData.data.uncommittedChanges.user.id,
                email: subscriptionData.data.uncommittedChanges.user.email,
                __typename: 'User'
              }
              let changes = [...prev.repo.uncommittedChanges]
              if (!changes.some(change => {
                return change.id === newChange.id
              })) {
                changes.push(newChange)
              }
              return Object.assign({}, prev, {
                repo: {
                  id: prev.repo.id,
                  uncommittedChanges: changes,
                  __typename: 'Repo'
                }
              })
            } else if (action === 'delete') {
              return Object.assign({}, prev, {
                repo: {
                  id: prev.repo.id,
                  uncommittedChanges: [
                    ...prev.repo.uncommittedChanges.filter(
                      change =>
                        change.id !==
                        subscriptionData.data.uncommittedChanges.user.id
                    )
                  ],
                  __typename: 'Repo'
                }
              })
            }
          }
        })
      }
    }
  }
})(UncommittedChanges)
