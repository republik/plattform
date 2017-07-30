import React, { Component } from 'react'
import { Link, Router } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'


const query = gql`
query tree($organization: String!, $repo: String!, $expression: String) {
  viewer {
    organization(login: $organization) {
      repository(name: $repo) {
        object(expression: $expression) {
          ... on Commit {
            oid
						history(first: 20) {
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
  }
}
`

const List = ({
  data: { loading, error, viewer },
  organization,
  repo,
  path
}) => {
	if (loading) {
		return (
			<div>Loading</div>
		)
	}

  let commits
  try {
    commits = viewer.organization.repository.object.history.nodes
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
                organization,
                repo,
                path: commit.oid+':'
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
  options: (props) => ({
    variables: {
      organization: props.organization,
      repo: props.repo,
      expression: props.path
    }
  })
})(List)
