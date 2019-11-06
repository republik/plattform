import React, { Component, Fragment } from 'react'
import { withRouter } from 'next/router'
import { css } from 'glamor'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import { path } from 'ramda'

import withAuthorization from '../../components/Auth/withAuthorization'

import Loader from '../../components/Loader'
import Tree from '../../components/Tree'
import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import RepoArchive from '../../components/Repo/Archive'
import RepoArchivedBanner from '../../components/Repo/ArchivedBanner'
import {
  NarrowContainer,
  A,
  InlineSpinner,
  Interaction
} from '@project-r/styleguide'
import { getKeys as getLocalStorageKeys } from '../../lib/utils/localStorage'
import * as fragments from '../../lib/graphql/fragments'

import CurrentPublications from '../../components/Publication/Current'
import UncommittedChanges from '../../components/VersionControl/UncommittedChanges'

export const COMMIT_LIMIT = 20
export const getRepoHistory = gql`
  query repoWithHistory($repoId: ID!, $first: Int!, $after: String) {
    repo(id: $repoId) {
      id
      isArchived
      commits(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...SimpleCommit
        }
      }
      milestones {
        ...SimpleMilestone
      }
    }
  }
  ${fragments.SimpleMilestone}
  ${fragments.SimpleCommit}
`

const treeRepoSubscription = gql`
  subscription onRepoUpdate($repoId: ID!) {
    repoUpdate(repoId: $repoId) {
      id
      isArchived
      commits(first: 1) {
        nodes {
          ...SimpleCommit
        }
      }
      milestones {
        ...SimpleMilestone
      }
    }
  }
  ${fragments.SimpleCommit}
  ${fragments.SimpleMilestone}
`

const styles = {
  publishContainer: css({
    marginTop: '24px'
  }),
  loadMoreButton: css({
    cursor: 'pointer'
  }),
  loadMore: css({
    positon: 'relative',
    textAlign: 'center',
    width: '100%',
    marginTop: '24px',
    height: '64px'
  })
}

class EditorPage extends Component {
  componentDidMount() {
    this.subscribe()
  }

  componentDidUpdate() {
    this.subscribe()
  }

  subscribe() {
    if (!this.unsubscribe && this.props.data.repo) {
      this.unsubscribe = this.props.data.subscribeToMore({
        document: treeRepoSubscription,
        variables: {
          repoId: this.props.router.query.repoId
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev
          }
          const newLatestCommit = path(
            ['commits', 'nodes', 0],
            subscriptionData.data.repoUpdate
          )
          const currentLatestCommit = path(
            ['repo', 'commits', 'nodes', 0],
            prev
          )

          const { milestones } = subscriptionData.data.repoUpdate
          if (newLatestCommit !== currentLatestCommit) {
            const nextNodes = [
              newLatestCommit,
              ...prev.repo.commits.nodes
            ].filter((value, index, self) => {
              return self.findIndex(v => v.id === value.id) === index
            })
            return {
              ...prev,
              repo: {
                ...prev.repo,
                commits: {
                  ...prev.repo.commits,
                  nodes: nextNodes
                },
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

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe()
  }

  render() {
    const { router, commits, hasMore, fetchMore } = this.props
    const { loading, error, repo } = this.props.data
    const { repoId } = router.query

    const localStorageCommitIds = getLocalStorageKeys()
      .filter(key => key.startsWith(repoId))
      .map(key => key.split('/').pop())
    return (
      <Frame>
        <Frame.Header>
          <Frame.Header.Section align='left'>
            <Frame.Nav>
              <RepoNav route='repo/tree' />
            </Frame.Nav>
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            {!!repo && (
              <div style={{ marginRight: 10 }}>
                <UncommittedChanges repoId={repo.id} />
              </div>
            )}
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            <Frame.Me />
          </Frame.Header.Section>
        </Frame.Header>
        <Frame.Body raw>
          <Loader
            loading={loading && !repo}
            error={error}
            render={() => (
              <Fragment>
                {repo.isArchived ? (
                  <RepoArchivedBanner />
                ) : (
                  <NarrowContainer {...styles.publishContainer}>
                    <CurrentPublications repoId={repoId} />
                    <RepoArchive repoId={repoId} />
                  </NarrowContainer>
                )}
                <Tree
                  commits={commits}
                  localStorageCommitIds={localStorageCommitIds}
                  milestones={repo.milestones}
                  repoId={repoId}
                />
                {/* Load more commits */
                hasMore && (
                  <Interaction.P {...styles.loadMore}>
                    {loading && <InlineSpinner size={40} />}
                    {!loading && (
                      <A {...styles.loadMoreButton} onClick={() => fetchMore()}>
                        Ältere laden
                      </A>
                    )}
                  </Interaction.P>
                )}
              </Fragment>
            )}
          />
        </Frame.Body>
      </Frame>
    )
  }
}

export default compose(
  withRouter,
  withAuthorization(['editor']),
  graphql(getRepoHistory, {
    options: ({ router }) => {
      return {
        variables: {
          repoId: router.query.repoId,
          first: COMMIT_LIMIT
        },
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-and-network'
      }
    },
    props: ({ data, ownProps }) => {
      return {
        data,
        commits:
          (data.repo && data.repo.commits && data.repo.commits.nodes) || [],
        hasMore:
          data.repo &&
          data.repo.commits &&
          data.repo.commits.pageInfo.hasNextPage,
        fetchMore: () => {
          return data.fetchMore({
            variables: {
              repoId: data.repo.id,
              first: COMMIT_LIMIT,
              after: data.repo.commits.pageInfo.endCursor
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              return {
                repo: {
                  ...previousResult.repo,
                  ...fetchMoreResult.repo,
                  commits: {
                    ...previousResult.repo.commits,
                    ...fetchMoreResult.repo.commits,
                    nodes: [
                      ...previousResult.repo.commits.nodes,
                      ...fetchMoreResult.repo.commits.nodes
                    ].filter(
                      ({ id }, i, all) =>
                        // deduplicate by id
                        i === all.findIndex(repo => repo.id === id)
                    )
                  }
                }
              }
            }
          })
        }
      }
    }
  })
)(EditorPage)
