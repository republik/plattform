import React, { Component } from 'react'
import {compose} from 'redux'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'
import { Raw, resetKeyGenerator } from 'slate'
import Editor from '../../../editor/components/Editor'

const GithubEditor = ({
  data: { loading, error, viewer },
  organization,
  repo,
  branch,
  path,
  commit
}) => {
  if (loading) {
    return (
      <div>Loading</div>
    )
  }

  let text
  let state
  try {
    resetKeyGenerator()
    text = viewer.organization.repository.object.text
    const json = JSON.parse(text)
    state = Raw.deserialize(json, {terse: true})
  } catch (e) {
    console.log(e)
    console.log(state)
  }

  const commitHandler = (state) => {
    commit({
      organization,
      repo,
      branch,
      path,
      content: JSON.stringify(
        Raw.serialize(state, {terse: true}),
        null,
        2),
      message: 'test'
    }).then( () => {
      console.log("commit returned")
    }).catch( (e) => {
      console.log("commit catched")
      console.log(e)
    })
  }

  if(state) {
    return (
      <Editor
        state={state}
        onCommit={commitHandler}
      />
    )
  } else if (text) {
    return (
      <div>
        <div>Readonly:</div>
        <pre>{text}</pre>
      </div>
    )
  } else {
    return (
      <div><i>empty</i></div>
    )
  }
}

const query = gql`
query tree($organization: String!, $repo: String!, $expression: String) {
  viewer {
    organization(login: $organization) {
      repository(name: $repo) {
        name
        object(expression: $expression) {
          ... on Blob {
            text
          }
        }
      }
    }
  }
}
`

const mutation = gql`
mutation commit($organization: String!, $repo: String!, $branch: String!, $path: String!, $message: String!, $content: String!) {
  commit(organization: $organization, repo: $repo, branch: $branch, path: $path, message: $message, content: $content) {
    id
  }
}
`

export default compose(
  graphql(query, {
    options: (props) => ({
      variables: {
        organization: props.organization,
        repo: props.repo,
        expression: `refs/heads/${props.branch}:${props.path || ''}`
      }
    })
  }),
  graphql(mutation, {
    props: ({mutate}) => ({
      commit: variables => mutate({
        variables,
        refetchQueries: [{
          query
        }]
      })
    })
  })
)(GithubEditor)
