import React, {Component} from 'react'
import {compose} from 'redux'
import { Router } from '../../../../server/routes'
import { gql, graphql } from 'react-apollo'
import { Raw, resetKeyGenerator } from 'slate'
import { css } from 'glamor'
import blank from '../../../editor/templates/blank.json'
import createEditor from '../../../editor'
import StyleguideTheme from '../../../editor/themes/styleguide'

const { Editor } = createEditor(StyleguideTheme)

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

const commitMutation = gql`
mutation commit($login: String!, $repository: String!, $branch: String!, $path: String!, $commitOid: String!, $message: String!, $content: String!) {
  commit(login: $login, repository: $repository, branch: $branch, path: $path, commitOid: $commitOid, message: $message, content: $content) {
    sha
    ref
  }
}
`

const uncommitedChangesMutation = gql`
mutation uncommitedChanges(
  $login: String!,
  $repository: String!,
  $path: String!,
  $action: Action!
) {
  uncommitedChanges(
    login: $login,
    repository: $repository,
    path: $path,
    action: $action
  )
}
`

const styles = {
  uncommitedChanges: {
    color: 'red'
  }
}

const blobExpressionFromPath = path => path.replace('/', ':')
const commitExpressionFromPath = path => path.split('/')[0]
const localStorageKey = (repository, view, path) => {
  const _path = `${repository.commit.oid}:${path.split('/')[1]}`
  return `${repository.owner.login}/${repository.name}/${view}/${_path}`
}

class GithubEditor extends Component {
  constructor (props) {
    super(props)
    this.changeHandler = this.changeHandler.bind(this)
    this.commitHandler = this.commitHandler.bind(this)
    this.loadState = this.loadState.bind(this)
    this.revertHandler = this.revertHandler.bind(this)
    this.state = {
      editorState: null,
      commit: null,
      text: null,
      commiting: false
    }
  }

  componentWillReceiveProps (nextProps) {
    resetKeyGenerator()
    this.loadState(nextProps)
  }

  revertHandler (e) {
    const { data: { repository }, view, path, uncommitedChangesMutation } = this.props
    window.localStorage.removeItem(localStorageKey(repository, view, path))
    uncommitedChangesMutation({
      login: repository.owner.login,
      repository: repository.name,
      path,
      action: 'delete'
    }).catch((error) => {
      console.log('uncommitedChangesMutation error')
      console.log(error)
    })
    this.loadState(this.props)
    this.setState({
      uncommitedChanges: false
    })
  }

  loadState (props) {
    const {
      data: { loading, error, repository },
      view,
      path,
      uncommitedChangesMutation
    } = props

    if (error) {
      console.log('graphql error:', error)
    }
    if (loading) {
      return
    }

    const _localStorageKey = localStorageKey(repository, view, path)
    let parsedLocalState
    const localState = window.localStorage.getItem(_localStorageKey)
    if (localState) {
      try {
        parsedLocalState = JSON.parse(localState)
      } catch (e) {
        console.log('parsing error', e)
        window.localStorage.removeItem(_localStorageKey)
      }
    }

    if (parsedLocalState) {
      uncommitedChangesMutation({
        login: repository.owner.login,
        repository: repository.name,
        path,
        action: 'create'
      }).catch((error) => {
        console.log('uncommitedChangesMutation error')
        console.log(error)
      })
      this.setState({
        uncommitedChanges: true,
        editorState: Raw.deserialize(parsedLocalState.editorState, {terse: true}),
        commit: parsedLocalState.commit
      })
    } else {
      uncommitedChangesMutation({
        login: repository.owner.login,
        repository: repository.name,
        path,
        action: 'delete'
      }).catch((error) => {
        console.log('uncommitedChangesMutation error')
        console.log(error)
      })
      let editorState
      if (view === 'new') {
        editorState = Raw.deserialize(blank, {terse: true})
      } else {
        try {
          const json = JSON.parse(repository.blob.text)
          editorState = Raw.deserialize(json, {terse: true})
        } catch (e) {
          console.log('parsing error', e)
        }
      }

      this.setState({
        commit: repository.commit,
        text: !editorState ? repository.blob.text : null,
        editorState,
        commitedEditorState: editorState
      })
    }
  }

  changeHandler (newEditorState) {
    const { data: { repository }, view, path, uncommitedChangesMutation } = this.props
    const { commitedEditorState, uncommitedChanges } = this.state

    const serializedNewEditorState = Raw.serialize(newEditorState, {terse: true})
    const serializedEditorState = Raw.serialize(commitedEditorState, {terse: true})
    if (JSON.stringify(serializedNewEditorState) !== JSON.stringify(serializedEditorState)) {
      window.localStorage.setItem(
        localStorageKey(repository, view, path),
        JSON.stringify({
          editorState: serializedNewEditorState,
          commit: repository.commit
        })
      )

      if (!uncommitedChanges) {
        this.setState({
          uncommitedChanges: true
        })
        uncommitedChangesMutation({
          login: repository.owner.login,
          repository: repository.name,
          path,
          action: 'create'
        }).catch((error) => {
          console.log('uncommitedChangesMutation error')
          console.log(error)
        })
      }
    } else {
      if (uncommitedChanges) {
        window.localStorage.removeItem(
          localStorageKey(repository, view, path)
        )
        this.setState({
          uncommitedChanges: false
        })
        uncommitedChangesMutation({
          login: repository.owner.login,
          repository: repository.name,
          path,
          action: 'delete'
        }).catch((error) => {
          console.log('uncommitedChangesMutation error')
          console.log(error)
        })
      }
    }

    this.setState({editorState: newEditorState})
  }

  commitHandler (editorState) {
    const {
      data: { repository },
      view,
      path,
      commitMutation
    } = this.props

    this.setState({
      commiting: true
    })
    const message = window.prompt('commit message:')
    commitMutation({
      login: repository.owner.login,
      repository: repository.name,
      branch: path.split('/')[0],
      path: path.split('/')[1],
      commitOid: repository.commit.oid,
      message,
      content: JSON.stringify(
        Raw.serialize(editorState, {terse: true}),
        null,
        2)
    }).then((result) => {
      window.localStorage.removeItem(localStorageKey(repository, view, path))
      uncommitedChangesMutation({
        login: repository.owner.login,
        repository: repository.name,
        path,
        action: 'delete'
      }).catch((error) => {
        console.log('uncommitedChangesMutation error')
        console.log(error)
      })
      const {ref} = result.data.commit
      const committedOnBranch = ref.split('refs/heads/')[1]
      if (committedOnBranch !== path.split('/')[0] || view === 'new') {
        const newPath = `${committedOnBranch}/${path.split('/')[1]}`
        setTimeout(() => {
          Router.pushRoute('github', {
            login: repository.owner.login,
            repository: repository.name,
            view: 'edit',
            path: newPath.split('/')
          })
          this.setState({
            commiting: false,
            uncommitedChanges: false
          })
        }, 2000)
      } else {
        this.setState({
          commiting: false,
          uncommitedChanges: false
        })
      }
    }).catch((e) => {
      console.log('commit catched')
      console.log(e)
    })
  }

  render () {
    const {
      data: { loading }
    } = this.props

    const {
      editorState,
      text,
      commit,
      commiting,
      uncommitedChanges
    } = this.state

    if (loading) {
      return (
        <div>Loading</div>
      )
    }
    if (commiting) {
      return (
        <div>Commiting...</div>
      )
    }

    if (editorState) {
      return (
        <div>
          <div>working on commit: {commit.abbreviatedOid}</div>
          {uncommitedChanges &&
            <div {...css(styles.uncommitedChanges)}>
              <span>you have uncommited changes!</span>
              <button onClick={this.revertHandler}>
                revert
              </button>
            </div>
          }
          <Editor
            state={editorState}
            onCommit={this.commitHandler}
            onChange={this.changeHandler}
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
}

export default compose(
  graphql(query, {
    options: ({login, repository, path}) => ({
      variables: {
        login,
        repository,
        blobExpression: blobExpressionFromPath(path),
        commitExpression: commitExpressionFromPath(path)
      }
    })
  }),
  graphql(commitMutation, {
    props: ({mutate, ownProps: {login, repository, path}}) => ({
      commitMutation: variables => mutate({
        variables,
        refetchQueries: [{
          query,
          variables: {
            login,
            repository,
            blobExpression: blobExpressionFromPath(path),
            commitExpression: commitExpressionFromPath(path)
          }
        }]
      })
    })
  }),
  graphql(uncommitedChangesMutation, {
    props: ({mutate, ownProps: {login, repository, path}}) => ({
      uncommitedChangesMutation: variables => mutate({
        variables
      })
    })
  })
)(GithubEditor)
