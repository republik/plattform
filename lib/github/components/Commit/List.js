import React, { Component } from 'react'
import { Link, Router } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'


const query = gql`
query tree($login: String!, $repository: String!, $expression: String) {
  repository(owner: $login, name: $repository) {
    owner {
      login
    }
    name
    object(expression: $expression) {
      ... on Commit {
        oid
        history(first: 30) {
          nodes {
            oid
            messageHeadline
            messageBody
          }
        }
      }
    }
  }
}
`

const List = ({
  data: { loading, error, repository },
  path,
}) => {
	if (loading) {
		return (
			<div>Loading</div>
		)
	}

  let commits
  try {
    commits = repository.object.history.nodes
  } catch (e) {}

  const pathGenerator = (oldPath, newPart) =>
    `${oldPath}${!oldPath.endsWith(':') ? '/' : ''}${newPart}`

  if (commits) {
    return (
      <div>
        <ul>
          {commits.map(commit => (
            <li key={commit.oid}>
            <Link
              route="github"
              params={Object.assign({}, {
                login: repository.owner.login,
                repository: repository.name,
                view: 'tree',
                path: commit.oid
              })
            }>
                <a>
                  <strong>{commit.messageHeadline}</strong><br />
                  {commit.messageBody}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  } else {
    return (
      <div><i>empty</i></div>
    )
  }
}

export default graphql(query, {
  options: ({login, repository, path}) => ({
    variables: {
      login,
      repository,
      expression: path.split('/')[0] //without ':' to indicate commit
    }
  })
})(List)
