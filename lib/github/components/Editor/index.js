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
query query(
  $login: String!,
  $repository: String!,
  $commitExpression: String,
  $blobExpression: String
) {
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
mutation commit(
  $login: String!,
  $repository: String!,
  $branch: String!,
  $path: String!,
  $commitOid: String!,
  $message: String!,
  $content: String!
) {
  commit(
    login: $login,
    repository: $repository,
    branch: $branch,
    path: $path,
    commitOid: $commitOid,
    message: $message,
    content: $content
  ) {
    sha
    ref
  }
}
`

const uncommittedChangesMutation = gql`
mutation uncommittedChanges(
  $login: String!,
  $repository: String!,
  $path: String!,
  $action: Action!
) {
  uncommittedChanges(
    login: $login,
    repository: $repository,
    path: $path,
    action: $action
  )
}
`

const styles = {
  uncommittedChanges: {
    color: 'red'
  }
}

const blobExpressionFromPath = path => path.replace('/', ':')
const commitExpressionFromPath = path => path.split('/')[0]
const getLocalStorageKey = (repository, view, path) => {
  const _path = `${repository.commit.oid}:${path.split('/').slice(1).join('/')}`
  return `${repository.owner.login}/${repository.name}/${view}/${_path}`
}

class GithubEditor extends Component {
  constructor (props) {
    super(props)
    this.changeHandler = this.changeHandler.bind(this)
    this.documentChangeHandler = this.documentChangeHandler.bind(this)
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
    const { data: { repository }, view, path } = this.props
    window.localStorage.removeItem(getLocalStorageKey(repository, view, path))
    this.loadState(this.props)
  }

  loadState (props) {
    const {
      data: { loading, error, repository },
      view,
      path,
      uncommittedChangesMutation
    } = props

    if (error) {
      console.log('graphql error:', error)
    }
    if (loading) {
      return
    }

    let localState
    const localStorageKey = getLocalStorageKey(repository, view, path)
    const unparsedLocalState = window.localStorage.getItem(localStorageKey)
    if (unparsedLocalState) {
      try {
        localState = JSON.parse(unparsedLocalState)
      } catch (e) {
        console.log('parsing error', e)
        window.localStorage.removeItem(localStorageKey)
      }
    }

    let committedEditorState
    if (view === 'new') {
      committedEditorState = Raw.deserialize(blank, {terse: true})
    } else {
      try {
        const json = JSON.parse(repository.blob.text)
        committedEditorState = Raw.deserialize(json, {terse: true})
      } catch (e) {
        console.log('parsing error', e)
      }
    }

    if (localState) {
      uncommittedChangesMutation({
        login: repository.owner.login,
        repository: repository.name,
        path,
        action: 'create'
      }).catch((error) => {
        console.log('uncommittedChangesMutation error')
        console.log(error)
      })
      this.setState({
        uncommittedChanges: true,
        commit: localState.commit,
        editorState: Raw.deserialize(localState.editorState, {terse: true}),
        committedEditorState
      })
    } else {
      uncommittedChangesMutation({
        login: repository.owner.login,
        repository: repository.name,
        path,
        action: 'delete'
      }).catch((error) => {
        console.log('uncommittedChangesMutation error')
        console.log(error)
      })
      this.setState({
        uncommittedChanges: false,
        commit: repository.commit,
        editorState: committedEditorState,
        committedEditorState,
        text: !committedEditorState ? repository.blob.text : null
      })
    }
  }

  changeHandler (newEditorState) {
    this.setState({editorState: newEditorState})
  }

  documentChangeHandler (document, newEditorState) {
    const { data: { repository }, view, path, uncommittedChangesMutation } = this.props
    const { committedEditorState, uncommittedChanges } = this.state

    const serializedNewEditorState = Raw.serialize(newEditorState, {terse: true})
    const serializedCommittedEditorState = Raw.serialize(committedEditorState, {terse: true})
    if (JSON.stringify(serializedNewEditorState) !== JSON.stringify(serializedCommittedEditorState)) {
      window.localStorage.setItem(
        getLocalStorageKey(repository, view, path),
        JSON.stringify({
          editorState: serializedNewEditorState,
          commit: repository.commit
        })
      )

      if (!uncommittedChanges) {
        this.setState({
          uncommittedChanges: true
        })
        uncommittedChangesMutation({
          login: repository.owner.login,
          repository: repository.name,
          path,
          action: 'create'
        }).catch((error) => {
          console.log('uncommittedChangesMutation error')
          console.log(error)
        })
      }
    } else {
      if (uncommittedChanges) {
        window.localStorage.removeItem(
          getLocalStorageKey(repository, view, path)
        )
        this.setState({
          uncommittedChanges: false
        })
        uncommittedChangesMutation({
          login: repository.owner.login,
          repository: repository.name,
          path,
          action: 'delete'
        }).catch((error) => {
          console.log('uncommittedChangesMutation error')
          console.log(error)
        })
      }
    }
  }

  commitHandler () {
    const {
      data: { repository },
      view,
      path,
      commitMutation,
      uncommittedChangesMutation
    } = this.props
    const {
      editorState
    } = this.state

    this.setState({
      commiting: true
    })
    const message = window.prompt('commit message:')
    commitMutation({
      login: repository.owner.login,
      repository: repository.name,
      branch: path.split('/')[0],
      path: path.split('/').slice(1).join('/'),
      commitOid: repository.commit.oid,
      message,
      content: JSON.stringify(
        Raw.serialize(editorState, {terse: true}),
        null,
        2)
    }).then((result) => {
      window.localStorage.removeItem(getLocalStorageKey(repository, view, path))
      uncommittedChangesMutation({
        login: repository.owner.login,
        repository: repository.name,
        path,
        action: 'delete'
      }).catch((error) => {
        console.log('uncommittedChangesMutation error')
        console.log(error)
      })
      const {ref} = result.data.commit
      const committedOnBranch = ref.split('refs/heads/')[1]
      if (committedOnBranch !== path.split('/')[0] || view === 'new') {
        const newPath = `${committedOnBranch}/${path.split('/').slice(1).join('/')}`
        setTimeout(() => {
          Router.pushRoute('github', {
            login: repository.owner.login,
            repository: repository.name,
            view: 'edit',
            path: newPath.split('/')
          })
          this.setState({
            commiting: false,
            uncommittedChanges: false
          })
        }, 2000)
      } else {
        this.setState({
          commiting: false,
          uncommittedChanges: false
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
      commiting,
      uncommittedChanges
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
          {uncommittedChanges &&
            <div {...css(styles.uncommittedChanges)}>
              <span>you have uncommitted changes!</span>
              <button onClick={this.revertHandler}>
                revert
              </button>
              <button onClick={this.commitHandler}>
                commit
              </button>
            </div>
          }
          <Editor
            state={editorState}
            onChange={this.changeHandler}
            onDocumentChange={this.documentChangeHandler}
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
  graphql(uncommittedChangesMutation, {
    props: ({mutate}) => ({
      uncommittedChangesMutation: variables => mutate({
        variables
      })
    })
  })
)(GithubEditor)
