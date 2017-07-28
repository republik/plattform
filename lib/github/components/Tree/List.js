import React, { Component } from 'react'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'


const treeQuery = gql`
query tree($organization: String!, $repo: String!, $expression: String) {
  viewer {
    organization(login: $organization) {
      repository(name: $repo) {
        name
        object(expression: $expression) {
          ... on Tree {
            entries {
              name
              oid
              type
            }
          }
        }
      }
    }
  }
}
`

const List = ({
  data: { loading, error, viewer },
  organization,
  repo,
  branch,
  path
}) => {
	if (loading) {
		return (
			<div>Loading</div>
		)
	}

  let tree
  try {
    tree = viewer.organization.repository.object.entries
  } catch (e) {}

  if (tree) {
    return (
      <ul>
        {tree.map(treeEntry => (
            <li key={treeEntry.oid}>
            <Link
              route="github"
              params={Object.assign({}, {
                organization,
                repo,
                branch,
                path: `${path ? path+'/' : ''}${treeEntry.name}`,
              },
                (treeEntry.type === 'blob') ? {edit: true} : null
              )
            }>
              <a>{treeEntry.name}</a>
            </Link>
            </li>
        ))}
      </ul>
    )
  } else {
    return (
      <div><i>empty</i></div>
    )
  }
}

//"refs/heads/apollo-github:lib/"
export default graphql(treeQuery, {
  options: (props) => ({
    variables: {
      organization: props.organization,
      repo: props.repo,
      expression: `refs/heads/${props.branch}:${props.path || ''}`
    }
  })
})(List)
