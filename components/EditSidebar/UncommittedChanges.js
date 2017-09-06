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
    this.subscribe()
  }

  componentDidUpdate () {
    this.subscribe()
  }

  subscribe () {
    if (!this.unsubscribe && this.props.data.repo) {
      this.unsubscribe = this.props.subscribeToNewChanges()
    }
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
              console.warn('empty subscription data')
              return prev
            }
            let uncommittedChanges = prev.repo.uncommittedChanges
            const action = subscriptionData.data.uncommittedChanges.action
            if (action === 'create') {
              const newUser = subscriptionData.data.uncommittedChanges.user
              if (!uncommittedChanges.find(user => user.id === newUser.id)) {
                uncommittedChanges = uncommittedChanges.concat(
                  newUser
                )
              }
            } else if (action === 'delete') {
              uncommittedChanges = uncommittedChanges.filter(
                change =>
                  change.id !==
                  subscriptionData.data.uncommittedChanges.user.id
              )
            }
            return {
              ...prev,
              repo: {
                ...prev.repo,
                uncommittedChanges
              }
            }
          }
        })
      }
    }
  }
})(UncommittedChanges)
