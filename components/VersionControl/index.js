import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { compose } from 'redux'
import { Label } from '@project-r/styleguide'
import Loader from '../Loader'
import withT from '../../lib/withT'

import BaseCommit from './BaseCommit'
import Checklist from './Checklist'
import CommitHistory from './CommitHistory'

const styles = {
  container: css({
    backgroundColor: '#fff'
  }),
  button: {
    height: 40,
    fontSize: '16px'
  }
}

const fragments = {
  commit: gql`
    fragment SidebarCommit on Commit {
      id
      date
      message
      author {
        name
      }
    }
  `
}

const getCommits = gql`
  query getCommits($repoId: ID!) {
    repo(id: $repoId) {
      id
      commits {
        ...SidebarCommit
      }
    }
  }
  ${fragments.commit}
`

const repoSubscription = gql`
  subscription repoUpdate($repoId: ID!) {
    repoUpdate(repoId: $repoId) {
      id
      commits {
        ...SidebarCommit
      }
    }
  }
  ${fragments.commit}
`

class EditSidebar extends Component {
  componentDidMount () {
    this.subscribe()
  }

  componentDidUpdate () {
    this.subscribe()
  }

  subscribe () {
    if (!this.props.isNew && !this.unsubscribe && this.props.data.repo) {
      this.unsubscribe = this.props.data.subscribeToMore({
        document: repoSubscription,
        variables: {
          repoId: this.props.repoId
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev
          }
          const { commits } = subscriptionData.data.repoUpdate
          if (commits && commits.length) {
            return {
              ...prev,
              repo: {
                ...prev.repo,
                commits: [...commits]
              }
            }
          } else {
            return prev
          }
        }
      })
    }
  }

  componentWillUnmount () {
    this.unsubscribe && this.unsubscribe()
  }

  render () {
    const {
      t,
      commit,
      hasUncommittedChanges,
      isNew,
      data = {}
    } = this.props
    const { loading, error, repo } = data

    if (isNew) {
      return <span>{t('commit/status/new')}</span>
    }

    return (
      <Loader
        loading={loading}
        error={error}
        render={() => (
          <div {...styles.container}>
            {!!repo && (
              <BaseCommit
                repoId={repo.id}
                commit={commit}
                commits={repo.commits}
              />
            )}
            {!!repo && (
              <div>
                <Label>{t('checklist/title')}</Label>
                <Checklist
                  disabled={!!hasUncommittedChanges}
                  repoId={repo.id}
                  commitId={commit.id}
                />
                <Label>{t('commitHistory/title')}</Label>
                <CommitHistory
                  repoId={repo.id}
                  commitId={commit.id}
                  commits={repo.commits}
                />
              </div>
            )}
          </div>
        )}
      />
    )
  }
}

export default compose(
  withT,
  graphql(getCommits, {
    skip: props => props.isNew,
    options: props => ({
      variables: {
        repoId: props.repoId
      },
      fetchPolicy: 'network-only'
    })
  })
)(EditSidebar)
