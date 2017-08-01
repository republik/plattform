import React, { Component } from 'react'
import { Link } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'


const query = gql`
query branches($login: String!, $repo: String!) {
  repository(owner: $login, name: $repo) {
    owner {
      login
    }
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
`

const List = ({
  data: { loading, error, repository }
}) => {
  if (loading) {
    return (
      <div>Loading</div>
    )
  }
  console.log(repository)

  let refs
  try {
    refs = repository.refs.nodes
  } catch (e) {}
  if (refs) {
    return (
      <ul>
        {refs.map(ref => (
          <li key={`${repository.name}/${ref.name}`}>
            <Link route="github" params={{
              login: repository.owner.login,
              repository: repository.name,
              view: 'tree',
              path: ref.name
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

export default graphql(query, {
  options: ({login, repository: repo}) => ({
    variables: {
      login,
      repo
    }
  })
})(List)
