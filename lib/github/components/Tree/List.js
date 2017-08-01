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
      ... on Tree {
        entries {
          name
          type
        }
      }
    }
  }
}
`

const List = ({
  data: { loading, error, repository },
  path
}) => {
  if (loading) {
    return (
      <div>Loading</div>
    )
  }
  console.log(path)

  let tree
  try {
    tree = repository.object.entries
  } catch (e) {}

  const newFileHandler = (e) => {
    if(e.key==='Enter') {
      Router.pushRoute('github', {
        login: repository.owner.login,
        repository: repository.name,
        view: 'new',
        path: path.split('/').concat(e.target.value)
      })
    }
  }

  if (tree) {
    return (
      <div>
        <ul>
          {tree.map(treeEntry => (
            <li key={treeEntry.name}>
              <Link
                route="github"
                params={{
                  login: repository.owner.login,
                  repository: repository.name,
                  view: treeEntry.type === 'blob' ? 'edit' : 'tree',
                  path: path.split('/').concat(treeEntry.name)
                }}
              >
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

export default graphql(query, {
  options: ({login, repository, path}) => ({
    variables: {
      login,
      repository,
      expression: (path.indexOf('/') === -1 ? path+':' : path.replace('/', ':')) //must end with ':' to indicate tree
    }
  })
})(List)
