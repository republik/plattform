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

export const query = gql`
  query repoWithHistory($repoId: ID!) {
    repo(id: $repoId) {
      id
      commits(page: 1) {
        id
        message
        parentIds
        date
        author {
          email
          name
        }
      }
      milestones {
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
    }
  }
`

class EditorPage extends Component {
  render () {
    const { url } = this.props
    const { loading, error, repo } = this.props.data
    const { repoId } = url.query

    return (
      <Frame url={url} raw nav={<RepoNav route='repo/tree' url={url} />}>
        <Loader loading={loading} error={error} render={() => (
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
        )} />
      </Frame>
    )
  }
}

export default compose(
  withData,
  withAuthorization(['editor']),
  graphql(query, {
    options: ({ url }) => ({
      variables: {
        repoId: url.query.repoId
      }
    })
  })
)(EditorPage)
