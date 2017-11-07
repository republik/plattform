import React, { Component } from 'react'
import { compose } from 'redux'
import { gql, graphql } from 'react-apollo'

import withData from '../../lib/apollo/withData'
import withAuthorization from '../../components/Auth/withAuthorization'

import Loader from '../../components/Loader'
import Tree from '../../components/Tree'
import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import CurrentPublications from '../../components/Publication/Current'
import { NarrowContainer } from '@project-r/styleguide'

const fragments = {
  commit: gql`
    fragment TreeCommit on Commit {
      id
      message
      parentIds
      date
      author {
        email
        name
      }
    }
  `,
  milestone: gql`
    fragment TreeMilestone on Milestone {
      name
      message
      immutable
      commit {
        id
      }
      author {
        email
        name
      }
    }
  `
}

export const repoQuery = gql`
  query repoWithHistory($repoId: ID!) {
    repo(id: $repoId) {
      id
      commits(page: 1) {
        ...TreeCommit
      }
      milestones {
        ...TreeMilestone
      }
    }
  }
  ${fragments.commit}
  ${fragments.milestone}
`

const repoSubscription = gql`
  subscription repoUpdate(
    $repoId: ID!
  ) {
    repoUpdate(
      repoId: $repoId
    ) {
      id
      latestCommit {
        ...TreeCommit
      }
      milestones {
        ...TreeMilestone
      }
    }
  }
  ${fragments.commit}
  ${fragments.milestone}
`

class EditorPage extends Component {
  componentDidMount () {
    this.subscribe()
  }

  componentDidUpdate () {
    this.subscribe()
  }

  subscribe () {
    if (!this.unsubscribe && this.props.data.repo) {
      this.unsubscribe = this.props.data.subscribeToMore({
        document: repoSubscription,
        variables: {
          repoId: this.props.url.query.repoId
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev
          }
          const { latestCommit, milestones } = subscriptionData.data.repoUpdate
          if (
            !prev.repo.commits.find(commit => commit.id === latestCommit.id)
          ) {
            const commits = prev.repo.commits.concat(latestCommit)
            return {
              ...prev,
              repo: {
                ...prev.repo,
                commits,
                milestones
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
    const { url } = this.props
    const { loading, error, repo } = this.props.data
    const { repoId } = url.query

    return (
      <Frame url={url} raw nav={<RepoNav route='repo/tree' url={url} />}>
        <Loader
          loading={loading}
          error={error}
          render={() => (
            <div>
              <br />
              <NarrowContainer>
                <CurrentPublications repoId={repoId} />
              </NarrowContainer>
              <Tree
                commits={repo.commits}
                milestones={repo.milestones}
                repoId={repoId}
              />
            </div>
          )}
        />
      </Frame>
    )
  }
}

export default compose(
  withData,
  withAuthorization(['editor']),
  graphql(repoQuery, {
    options: ({ url }) => ({
      variables: {
        repoId: url.query.repoId
      }
    })
  })
)(EditorPage)
