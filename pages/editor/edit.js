// TODO: Make commit mutation work.
// TODO: Implement subscription to uncommitted changes when new API is ready.

import React, { Component } from 'react'
import { compose } from 'redux'
import { Router } from '../../lib/routes'
import withData from '../../lib/apollo/withData'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { Raw, resetKeyGenerator } from 'slate'
import { A, Button, Label } from '@project-r/styleguide'

import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import Editor, { serializer } from '../../components/editor/NewsletterEditor'

import EditSidebar from '../../components/EditSidebar'
import Loader from '../../components/Loader'
import Checklist from '../../components/EditSidebar/Checklist'
import CommitHistory from '../../components/EditSidebar/CommitHistory'
import UncommittedChanges from '../../components/EditSidebar/UncommittedChanges'
import withAuthorization from '../../components/Auth/withAuthorization'

import initLocalStore from '../../lib/utils/localStorage'

const query = gql`
  query repo($repoId: ID!) {
    repo(id: $repoId) {
      id
      commits(page: 1) {
        id
        message
        parentIds
        date
        author {
          email
        }
        document {
          content
          commit {
            id
            message
          }
          meta {
            title
          }
        }
      }
      uncommittedChanges {
        id
        email
      }
    }
  }
`
const commitMutation = gql`
  mutation commit(
    $repoId: ID!
    $parentId: ID!
    $message: String!
    $document: DocumentInput!
  ) {
    commit(
      repoId: $repoId
      parentId: $parentId
      message: $message
      document: $document
    ) {
      id
      parentIds
      message
      author {
        email
      }
      date
      document {
        content
        commit {
          id
          message
        }
        meta {
          title
        }
      }
    }
  }
`

const uncommittedChangesMutation = gql`
  mutation uncommittedChanges($repoId: ID!, $action: Action!) {
    uncommittedChanges(repoId: $repoId, action: $action)
  }
`

const styles = {
  uncommittedChanges: {
    fontSize: '13px',
    margin: '0 0 20px'
  },
  danger: {
    color: 'red'
  },
  button: {
    height: 40,
    fontSize: '16px'
  }
}

const getLocalStorageKey = (repoId, commitId, view) => {
  return `${repoId}/${view}/${commitId}`
}

class EditorPage extends Component {
  constructor (...args) {
    super(...args)

    this.changeHandler = this.changeHandler.bind(this)
    this.commitHandler = this.commitHandler.bind(this)
    this.documentChangeHandler = this.documentChangeHandler.bind(this)
    this.revertHandler = this.revertHandler.bind(this)

    this.state = {
      commit: null,
      committing: false,
      editorState: null,
      localStorageNotSupported: false,
      repo: null,
      uncommittedChanges: null
    }
  }

  componentWillMount () {
    resetKeyGenerator()
    this.loadState(this.props)
  }

  componentWillReceiveProps (nextProps) {
    resetKeyGenerator()
    this.loadState(nextProps)
  }

  revertHandler (e) {
    e.preventDefault()
    this.store.clear()
    this.loadState(this.props)
  }

  loadState (props) {
    const {
      data: { loading, error, repo },
      url,
      uncommittedChangesMutation
    } = props

    if (loading || error) {
      return
    }
    if (!repo) {
      console.log('Could not load repo')
      return
    }

    this.setState({
      repo: repo
    })

    let commitId = url.query.commit
    let view = !commitId ? 'new' : 'edit'

    if (!this.store) {
      this.store = initLocalStore(getLocalStorageKey(repo.id, commitId, view))
      if (!this.store.supported) {
        this.setState({
          localStorageNotSupported: true
        })
      }
    }

    let committedEditorState
    let commit
    if (view === 'new') {
      committedEditorState = serializer.deserialize('')
    } else {
      commit = repo.commits.filter(commit => {
        return commit.id === commitId
      })[0]
      if (!commit) {
        this.setState({error: `missing commit ${commitId}`})
        return
      }

      const json = JSON.parse(commit.document.content)
      committedEditorState = serializer.deserialize(json, {
        mdast: true
      })

      this.setState({
        commit: commit
      })
    }

    let localState = this.store.getAll()
    let localEditorState
    if (localState && localState.editorState /* && localState.commit */) {
      try {
        localEditorState = Raw.deserialize(localState.editorState, {
          terse: true
        })
      } catch (e) {
        console.log('parsing error', e)
      }
    }

    if (localEditorState) {
      uncommittedChangesMutation({
        repoId: repo.id,
        action: 'create'
      }).catch(error => {
        console.log('uncommittedChangesMutation error')
        console.log(error)
      })
      this.setState({
        uncommittedChanges: true,
        // Do we actually need the commit here?
        // commit: localState.commit,
        editorState: localEditorState,
        committedEditorState
      })
    } else {
      uncommittedChangesMutation({
        repoId: repo.id,
        action: 'delete'
      }).catch(error => {
        console.log('uncommittedChangesMutation error')
        console.log(error)
      })
      this.setState({
        uncommittedChanges: false,
        // Do we actually need the commit here?
        // commit: commit, // repository.commit,
        editorState: committedEditorState,
        committedEditorState
      })
    }
  }

  changeHandler (newEditorState) {
    this.setState({ editorState: newEditorState })
  }

  documentChangeHandler (_, newEditorState) {
    const { data: { repo }, uncommittedChangesMutation } = this.props
    const { committedEditorState, uncommittedChanges } = this.state

    const serializedNewEditorState = Raw.serialize(newEditorState, {
      terse: true
    })
    const serializedCommittedEditorState = Raw.serialize(committedEditorState, {
      terse: true
    })
    if (
      JSON.stringify(serializedNewEditorState) !==
      JSON.stringify(serializedCommittedEditorState)
    ) {
      this.store.set('editorState', serializedNewEditorState)
      // Do we actually need the commit here?
      // this.store.set('commit', commit) //repository.commit)

      if (!uncommittedChanges) {
        this.setState({
          uncommittedChanges: true
        })
        uncommittedChangesMutation({
          repoId: repo.id,
          action: 'create'
        }).catch(error => {
          console.log('uncommittedChangesMutation error')
          console.log(error)
        })
      }
    } else {
      if (uncommittedChanges) {
        this.store.clear()
        this.setState({
          uncommittedChanges: false
        })
        uncommittedChangesMutation({
          repoId: repo.id,
          action: 'delete'
        }).catch(error => {
          console.log('uncommittedChangesMutation error')
          console.log(error)
        })
      }
    }
  }

  commitHandler () {
    const {
      data: { repo },
      url,
      view,
      commitMutation,
      uncommittedChangesMutation
    } = this.props
    const { editorState, commit } = this.state

    const message = window.prompt('Commit message:')
    if (!message) {
      return
    }
    this.setState({
      committing: true
    })

    commitMutation({
      repoId: repo.id,
      parentId: commit.id,
      message: message,
      document: {
        content: JSON.stringify(
          serializer.serialize(editorState, {
            mdast: true
          })
        )
      }
    })
      .then(result => {
        this.store.clear()
        uncommittedChangesMutation({
          repoId: repo.id,
          action: 'delete'
        }).catch(error => {
          console.log('uncommittedChangesMutation error')
          console.log(error)
        })

        // TODO: Determine whether autobranching occured and handle branching.
        let isNewBranch = false

        if (isNewBranch || view === 'new') {
          setTimeout(() => {
            Router.pushRoute('stories/edit', {
              repository: url.query.repository,
              commit: 'newCommitIDhere' // TODO: Fill in from response.
            })
            this.setState({
              committing: false,
              uncommittedChanges: false
            })
          }, 2000)
        } else {
          this.setState({
            committing: false,
            uncommittedChanges: false
          })
        }
      })
      .catch(e => {
        console.log('commit catched')
        console.log(e)
      })
  }

  render () {
    const { url } = this.props
    const { repository, commit } = url.query
    const { loading, error } = this.props.data
    const {
      editorState,
      committing,
      uncommittedChanges,
      localStorageNotSupported,
      error: stateError
    } = this.state
    const sidebarWidth = 200

    return (
      <Frame url={url} raw nav={<RepoNav route='editor/edit' url={url} />}>
        <Loader loading={committing || loading} error={error || stateError} render={() => (
          <div>
            <div style={{paddingRight: sidebarWidth}}>
              <Editor
                state={editorState}
                onChange={this.changeHandler}
                onDocumentChange={this.documentChangeHandler}
              />
            </div>
            <EditSidebar width={sidebarWidth}>
              {localStorageNotSupported &&
                <div {...css(styles.danger)}>
                  LocalStorage not available, your changes can't be saved locally!
                </div>}
              <div {...css(styles.uncommittedChanges)}>
                <div style={{marginBottom: 10}}>
                  {uncommittedChanges &&
                    <Label>You have uncommitted changes</Label>}
                  {!uncommittedChanges &&
                    <Label>All your changes are committed</Label>}
                </div>

                <Button
                  primary
                  block
                  disabled={!uncommittedChanges}
                  onClick={this.commitHandler}
                  style={styles.button}
                >
                  Commit
                </Button>

                {!!uncommittedChanges && (
                  <div style={{textAlign: 'center', marginTop: 10}}>
                    <A href='#' onClick={this.revertHandler}>
                      Revert
                    </A>
                  </div>
                )}

              </div>
              <Label>Checklist</Label>
              <Checklist
                disabled={!!uncommittedChanges}
                repoId={`orbiting/${repository}`}
                commitId={commit}
              />
              <Label>History</Label>
              <CommitHistory
                commits={this.state.repo.commits}
                repository={repository}
              />
              <Label>Who's working on this?</Label>
              <UncommittedChanges repoId={`orbiting/${repository}`} />
            </EditSidebar>
          </div>
        )} />
      </Frame>
    )
  }
}

export default compose(
  withData,
  withAuthorization(['editor']),
  graphql(query, {
    options: ({ url }) => ({
      variables: {
        repoId: 'orbiting/' + url.query.repository
      }
    })
  }),
  graphql(commitMutation, {
    props: ({ mutate, ownProps: { url } }) => ({
      commitMutation: variables =>
        mutate({
          variables,
          refetchQueries: [
            {
              query,
              variables: {
                repoId: 'orbiting/' + url.query.repository
              }
            }
          ]
        })
    })
  }),
  graphql(uncommittedChangesMutation, {
    props: ({ mutate }) => ({
      uncommittedChangesMutation: variables =>
        mutate({
          variables
        })
    })
  })
)(EditorPage)
