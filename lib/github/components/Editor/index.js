import {compose} from 'redux'
import { gql, graphql } from 'react-apollo'
import { Raw, resetKeyGenerator } from 'slate'
import Editor from '../../../editor/components/Editor'
import blank from '../../../editor/templates/blank.json'

const query = gql`
query query($login: String!, $repository: String!, $commitExpression: String, $blobExpression: String) {
  repository(owner: $login, name: $repository) {
    owner {
      login
    }
    name
    commit: object(expression: $commitExpression) {
      ... on Commit {
        oid
        abbreviatedOid
      }
    }
    blob: object(expression: $blobExpression) {
      ... on Blob {
        text
      }
    }
  }
}
`

const mutation = gql`
mutation commit($login: String!, $repository: String!, $branch: String!, $path: String!, $commitOid: String!, $message: String!, $content: String!) {
  commit(login: $login, repository: $repository, branch: $branch, path: $path, commitOid: $commitOid, message: $message, content: $content) {
    sha
  }
}
`

const GithubEditor = ({
  data: { loading, error, repository },
  view,
  path,
  commitMutation
}) => {
  if (loading) {
    return (
      <div>Loading</div>
    )
  }

  // TODO cleanup
  let text
  let commit
  let state
  try {
    commit = repository.commit
    text = repository.blob.text
    const json = JSON.parse(text)
    resetKeyGenerator()
    state = Raw.deserialize(json, {terse: true})
  } catch (e) {
    // console.log(e)
    // console.log(state)
  }

  if (view === 'new') {
    state = Raw.deserialize(blank, {terse: true})
  }

  const commitHandler = (state) => {
    const message = window.prompt('commit message:')
    commitMutation({
      login: repository.owner.login,
      repository: repository.name,
      branch: path.split('/')[0],
      path: path.split('/')[1],
      commitOid: commit.oid,
      message,
      content: JSON.stringify(
        Raw.serialize(state, {terse: true}),
        null,
        2)
    }).then((result) => {
      console.log('commit returned')
      console.log(result)
    }).catch((e) => {
      console.log('commit catched')
      console.log(e)
    })
  }

  if (state) {
    return (
      <div>
        <div>working on commit: {commit.abbreviatedOid}</div>
        <Editor
          state={state}
          onCommit={commitHandler}
        />
      </div>
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

export default compose(
  graphql(query, {
    options: ({login, repository, path}) => ({
      variables: {
        login,
        repository,
        blobExpression: path.replace('/', ':'),
        commitExpression: path.split('/')[0]
      }
    })
  }),
  graphql(mutation, {
    props: ({mutate, ownProps: {login, repository, path}}) => ({
      commitMutation: variables => mutate({
        variables,
        refetchQueries: [{
          query,
          variables: {
            login,
            repository,
            blobExpression: path,
            commitExpression: path.split('/')[0]
          }
        }]
      })
    })
  })
)(GithubEditor)
