import React, { Component } from 'react'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'


const treeQuery = gql`
query tree($organization: String!, $repo: String!, $branch: String!) {
  viewer {
    organization(login: $organization) {
      repository(name: $repo) {
				name
				ref(qualifiedName: $branch) {
          name
          target {
            ... on Commit {
              tree {
                entries {
                  name
                  oid
                }
              }
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
  branch
}) => {
	if (loading) {
		return (
			<div>Loading</div>
		)
	}

  let tree
  try {
    tree = viewer.organization.repository.ref.target.tree.entries
  } catch (e) {}
  if (tree) {
    return (
      <ul>
        {tree.map(treeEntry => (
          <li key={treeEntry.oid}>
            <Link route="github" params={{
              organization,
              repo,
              branch,
              oid: treeEntry.oid,
              filename: treeEntry.name
            }}>
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

export default graphql(treeQuery)(List)
