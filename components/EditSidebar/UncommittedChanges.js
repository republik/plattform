import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { css, merge } from 'glamor'
import { colors } from '@project-r/styleguide'
import { compose } from 'redux'
import Loader from '../../components/Loader'
import withT from '../../lib/withT'

const styles = {
  container: css({
    display: 'flex',
    flexFlow: 'row wrap',
    fontSize: '11px',
    padding: '5px 0'
  }),
  initials: {
    backgroundColor: '#ccc',
    color: '#000',
    cursor: 'default',
    fontSize: 16,
    height: 40,
    lineHeight: '40px',
    margin: '0 4px 4px 0',
    textAlign: 'center',
    textTransform: 'uppercase',
    width: 40
  },
  initialsPlaceholder: {
    backgroundColor: '#fff',
    border: `1px solid ${colors.divider}`
  }
}

// TODO: Factor out here and elsewhere into /utils.
const cleanName = string => (
  string.split('@')[0]
    .replace(/\s*\.\s*/, ' ')
    .split(' ')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
)

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
        name
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
    const { loading, error, data, t } = this.props

    return (
      <Loader loading={loading} error={error} render={() => (
        <div {...styles.container}>
          {!!data.repo.uncommittedChanges.length &&
            data.repo.uncommittedChanges.map(change =>
              <span key={change.id} {...css(styles.initials)} title={change.email}>
                {cleanName(change.email)
                  .split(' ')
                  .map(p => p[0])
                  .join('')}
              </span>
            )}
          {!data.repo.uncommittedChanges.length &&
            <span {...merge(styles.initials, styles.initialsPlaceholder)}
              title={t('uncommittedChanges/empty')} />}
        </div>
      )} />
    )
  }
}

export default compose(
  withT,
  graphql(query, {
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
  })
)(UncommittedChanges)
