import React, { Component } from 'react'
import { Link, Router } from '../../../../server/routes'
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

  const pathGenerator = (oldPath, newPart) =>
    `${oldPath}${!oldPath.endsWith(':') ? '/' : ''}${newPart}`

  const newFileHandler = (e) => {
    if(e.key==='Enter') {
      Router.pushRoute('github', {
        organization,
        repo,
        path: pathGenerator(path, e.target.value),
        create: true
      })
    }
  }

  if (tree) {
    return (
      <div>
        <ul>
          {tree.map(treeEntry => (
            <li key={treeEntry.oid}>
              <Link
                route="github"
                params={Object.assign({}, {
                  organization,
                  repo,
                  path: pathGenerator(path, treeEntry.name)
                },
                  (treeEntry.type === 'blob') ? {edit: true} : null
                )
              }>
                <a>{treeEntry.name}</a>
              </Link>
            </li>
          ))}
        </ul>
        <div>
          New file:{' '}<input
            type="text"
            placeholder="article.json"
            onKeyPress={newFileHandler}
          />
        </div>
      </div>
    )
  } else {
    return (
      <div><i>empty</i></div>
    )
  }
}

export default graphql(treeQuery, {
  options: (props) => ({
    variables: {
      organization: props.organization,
      repo: props.repo,
      expression: props.path
    }
  })
})(List)
