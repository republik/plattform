import React, { Component } from 'react'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'
import { Raw, resetKeyGenerator } from 'slate'
import Editor from '../../../editor/components/Editor'


const textQuery = gql`
query tree($organization: String!, $repo: String!, $oid: GitObjectID) {
  viewer {
    organization(login: $organization) {
      repository(name: $repo) {
				name
        object(oid: $oid) {
          ... on Blob {
            text
          }
				}
      }
    }
  }
}
`

const GithubEditor = ({
  data: { loading, error, viewer },
  organization,
  repo,
  branch,
  oid,
  filename
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

  if(state) {
    return (
      <Editor
        state={state}
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

export default graphql(textQuery)(GithubEditor)
