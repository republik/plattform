import React, { Component } from 'react'
import { compose } from 'redux'
import withData from '../../lib/apollo/withData'
import { gql, graphql } from 'react-apollo'

import Tree from '../../components/Tree'
import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'

const query = gql`
  query repo($repoId: ID!) {
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
  constructor (...args) {
    super(...args)
    this.state = {
      commits: []
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      commits: nextProps.data.repo.commits,
      milestones: nextProps.data.repo.milestones
    })
  }

  render () {
    const { url } = this.props
    const { repository, commit } = url.query

    return (
      <Frame url={url} raw nav={<RepoNav route='editor/tree' url={url} />}>
        <Tree
          commits={this.state.commits}
          milestones={this.state.milestones}
          repository={repository}
          commit={commit}
        />
      </Frame>
    )
  }
}

export default compose(
  withData,
  graphql(query, {
    options: ({ url }) => ({
      variables: {
        repoId: 'orbiting/' + url.query.repository
      }
    })
  })
)(EditorPage)
