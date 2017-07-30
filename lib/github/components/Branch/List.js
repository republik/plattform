import React, { Component } from 'react'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'


const branchesQuery = gql`
query branches($organization: String!, $repo: String!) {
  viewer {
    organization(login: $organization) {
      repository(name: $repo) {
        name
        refs(refPrefix: "refs/heads/", first: 20) {
          nodes {
            name
            target {
              ... on Commit {
                oid
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
	repo
}) => {
	if (loading) {
		return (
			<div>Loading</div>
		)
	}

  let refs
  try {
    refs = viewer.organization.repository.refs.nodes
  } catch (e) {}
  if (refs) {
    return (
      <ul>
        {refs.map(ref => (
          <li key={`${organization.name}/${repo.name}/${ref.name}`}>
            <Link route="github" params={{
              organization,
              repo,
              path: `${ref.name}:`
            }}>
              <a>{ref.name}</a>
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

export default graphql(branchesQuery)(List)
