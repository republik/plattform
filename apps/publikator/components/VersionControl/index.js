import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { css } from 'glamor'
import { Label } from '@project-r/styleguide'
import Loader from '../Loader'
import withT from '../../lib/withT'
import * as fragments from '../../lib/graphql/fragments'

import BaseCommit from './BaseCommit'
import Checklist from './Checklist'
import CommitHistory from './CommitHistory'

export const getCommits = gql`
  query getCommits($repoId: ID!, $after: String) {
    repo(id: $repoId) {
      id
      commits(first: 3, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
        }
        totalCount
        nodes {
          ...SimpleCommit
        }
      }
    }
  }
  ${fragments.SimpleCommit}
`

export const repoSubscription = gql`
  subscription onRepoChange($repoId: ID!) {
    repoChange(repoId: $repoId) {
      mutation
      repo {
        ...EditPageRepo
      }
      commit {
        ...SimpleCommit
      }
    }
  }
  ${fragments.EditPageRepo}
  ${fragments.SimpleCommit}
`

const styles = {
  container: css({
    backgroundColor: '#fff',
  }),
  button: {
    height: 40,
    fontSize: '16px',
  },
}

class EditSidebar extends Component {
  componentDidMount() {
    this.subscribe()
  }

  componentDidUpdate() {
    this.subscribe()
  }

  subscribe() {
    if (!this.props.isNew && !this.unsubscribe && this.props.data.repo) {
      this.unsubscribe = this.props.data.subscribeToMore({
        document: repoSubscription,
        variables: {
          repoId: this.props.repoId,
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev
          }

          const { repo, commit } = subscriptionData.data.repoChange

          const updatedRepo = { ...prev.repo, ...repo }
          const updatedCommitNodes = [
            commit,
            ...prev.repo.commits.nodes,
          ].filter(Boolean)

          return {
            ...prev,
            repo: {
              ...updatedRepo,
              commits: {
                ...prev.repo.commits,
                nodes: updatedCommitNodes,
              },
            },
          }
        },
      })
    }
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe()
  }

  render() {
    const { t, commit, hasUncommittedChanges, isNew, data = {} } = this.props
    const { loading, error, repo } = data

    if (isNew) {
      return <span>{t('commit/status/new')}</span>
    }

    return (
      <Loader
        loading={(loading && !repo) || !repo || !commit || !repo.commits}
        error={error}
        render={() => (
          <div {...styles.container}>
            {!!repo && !!repo.commits && !!repo.commits.nodes && (
              <BaseCommit
                repoId={repo.id}
                commit={commit}
                commits={repo.commits.nodes}
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
                  commits={repo.commits.nodes}
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
    skip: (props) => props.isNew,
    options: (props) => ({
      variables: {
        repoId: props.repoId,
      },
      fetchPolicy: 'cache-first',
    }),
  }),
)(EditSidebar)
