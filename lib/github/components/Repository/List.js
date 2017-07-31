import React, { Component } from 'react'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'


const reposQuery = gql`
query repositories($organization: String!) {
  viewer {
    organization(login: $organization) {
      repositories(first: 100) {
        nodes {
          name
        }
      }
    }
  }
}
`

const List = ({
  data: { loading, error, viewer },
  organization
}) => {
  if (loading) {
    return (
      <div>Loading</div>
    )
  }
  if (viewer && viewer.organization && viewer.organization.repositories) {
    return (
      <ul>
      {viewer.organization.repositories.nodes.map(repo => (
        <li key={`${organization.name}/${repo.name}`}>
    <Link route="github" params={{
            organization,
            repo: repo.name
          }}>
            <a>{repo.name}</a>
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

export default graphql(reposQuery)(List)
