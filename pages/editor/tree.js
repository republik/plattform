import React, { Component } from 'react'
import { compose } from 'redux'
import withData from '../../lib/apollo/withData'
import { gql, graphql } from 'react-apollo'

import App from '../../lib/App'
import Tree from '../../components/Tree'
import EditFrame from '../../components/EditFrame'

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
      commits: nextProps.data.repo.commits
    })
  }

  render () {
    const { repository, commit } = this.props.url.query

    return (
      <App>
        <EditFrame view={'tree'} repository={repository} commit={commit}>
          <Tree
            commits={this.state.commits}
            repository={repository}
            commit={commit}
          />
        </EditFrame>
      </App>
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
