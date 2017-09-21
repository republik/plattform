import React, { Component } from 'react'
import { compose } from 'redux'
import withData from '../../lib/apollo/withData'
import { gql, graphql } from 'react-apollo'

import Loader from '../../components/Loader'
import Tree from '../../components/Tree'
import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'

const query = gql`
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
          <Tree
            commits={repo.commits}
            milestones={repo.milestones}
            repoId={repoId}
          />
        )} />
      </Frame>
    )
  }
}

export default compose(
  withData,
  graphql(query, {
    options: ({ url }) => ({
      variables: {
        repoId: url.query.repoId
      }
    })
  })
)(EditorPage)
