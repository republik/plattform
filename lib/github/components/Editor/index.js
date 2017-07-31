import React, { Component } from 'react'
import {compose} from 'redux'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'
import { Raw, resetKeyGenerator } from 'slate'
import Editor from '../../../editor/components/Editor'
import blank from '../../../editor/templates/blank.json'

const GithubEditor = ({
  data: { loading, error, organization: _organization },
  organization,
  repo,
  path,
  create,
  commitMutation
}) => {
  if (loading) {
    return (
      <div>Loading</div>
    )
  }

  //TODO cleanup
  let text
  let commit
  let state
  try {
    commit = _organization.repository.commit
    text = _organization.repository.blob.text
    const json = JSON.parse(text)
    resetKeyGenerator()
    state = Raw.deserialize(json, {terse: true})
  } catch (e) {
    //console.log(e)
    //console.log(state)
  }

  if (create) {
    state = Raw.deserialize(blank, {terse: true})
  }

  const commitHandler = (state) => {
    commitMutation({
      organization,
      repo,
      branch: path.split(':')[0],
      path: path.split(':')[1],
      commitOid: commit.oid,
      message: 'test', //TODO make editable
      content: JSON.stringify(
        Raw.serialize(state, {terse: true}),
        null,
        2),
    }).then( (result) => {
      console.log("commit returned")
      console.log(result)
    }).catch( (e) => {
      console.log("commit catched")
      console.log(e)
    })
  }

  if(state) {
    return (
      <div>
        <div>working on commit: {commit.abbreviatedOid}</div>
        <Editor
          state={state}
          onCommit={commitHandler}
        />
      </div>
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
query query($organization: String!, $repo: String!, $commitExpression: String, $blobExpression: String) {
  organization(login: $organization) {
    repository(name: $repo) {
      commit: object(expression: $commitExpression) {
        ... on Commit {
          oid
          abbreviatedOid
        }
      }
      blob: object(expression: $blobExpression) {
        ... on Blob {
          text
        }
      }
    }
  }
}
`

const mutation = gql`
mutation commit($organization: String!, $repo: String!, $branch: String!, $path: String!, $commitOid: String!, $message: String!, $content: String!) {
  commit(organization: $organization, repo: $repo, branch: $branch, path: $path, commitOid: $commitOid, message: $message, content: $content) {
    sha
  }
}
`

export default compose(
  graphql(query, {
    options: (props) => ({
      variables: {
        organization: props.organization,
        repo: props.repo,
        blobExpression: props.path,
        commitExpression: props.path.split(':')[0]
      }
    })
  }),
  graphql(mutation, {
    props: ({mutate, ownProps}) => ({
      commitMutation: variables => mutate({
        variables,
        refetchQueries: [{
          query,
          variables: {
            organization: ownProps.organization,
            repo: ownProps.repo,
            blobExpression: ownProps.path,
            commitExpression: ownProps.path.split(':')[0]
          }
        }]
      })
    })
  })
)(GithubEditor)
