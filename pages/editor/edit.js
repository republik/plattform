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
import withT from '../../lib/withT'

import initLocalStore from '../../lib/utils/localStorage'

const fragments = {
  commit: gql`
    fragment EditPageCommit on Commit {
      id
      message
      parentIds
      date
      author {
        email
        name
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
  `
}

const query = gql`
  query repo($repoId: ID!) {
    repo(id: $repoId) {
      id
      commits(page: 1) {
        ...EditPageCommit
      }
      uncommittedChanges {
        id
        email
      }
    }
  }
  ${fragments.commit}
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
      ...EditPageCommit
    }
  }
  ${fragments.commit}
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

class EditorPage extends Component {
  constructor (...args) {
    super(...args)

    this.changeHandler = this.changeHandler.bind(this)
    this.commitHandler = this.commitHandler.bind(this)
    this.documentChangeHandler = this.documentChangeHandler.bind(this)
    this.revertHandler = this.revertHandler.bind(this)

    this.state = {
      committing: false,
      editorState: null,
      repo: null,
      uncommittedChanges: null
    }
  }

  beginChanges (repoId) {
    this.setState({
      uncommittedChanges: true
    })
    this.props.uncommittedChangesMutation({
      repoId: repoId,
      action: 'create'
    }).catch(error => {
      console.log('uncommittedChangesMutation error')
      console.log(error)
    })
  }

  concludeChanges (repoId) {
    this.setState({
      uncommittedChanges: false
    })
    this.props.uncommittedChangesMutation({
      repoId: repoId,
      action: 'delete'
    }).catch(error => {
      console.log('uncommittedChangesMutation error')
      console.log(error)
    })
  }

  componentWillMount () {
    resetKeyGenerator()
    this.loadState(this.props)
  }

  componentWillReceiveProps (nextProps) {
    resetKeyGenerator()
    this.loadState(nextProps)
  }

  checkLocalStorageSupport () {
    if (
      process.browser &&
      this.store &&
      !this.store.supported
    ) {
      this.setState({
        localStorageUnavailable: true
      })
    }
  }
  componentDidMount () {
    this.checkLocalStorageSupport()
  }

  revertHandler (e) {
    e.preventDefault()
    this.store.clear()
    this.loadState(this.props)
  }

  loadState (props) {
    const {
      data: { loading, error, repo },
      url
    } = props

    if (loading || error) {
      return
    }

    let commitId = url.query.commit || 'new'

    if (!this.store || this.store.storeKey !== commitId) {
      this.store = initLocalStore([repo.id, commitId].join('/'))
      this.checkLocalStorageSupport()
    }

    let committedEditorState
    if (commitId === 'new') {
      committedEditorState = serializer.deserialize('')
    } else {
      const commit = repo.commits.find(commit => {
        return commit.id === commitId
      })
      if (!commit) {
        this.setState({error: `missing commit ${commitId}`})
        return
      }

      const json = commit.document.content
      committedEditorState = serializer.deserialize(json, {
        mdast: true
      })

      this.setState({
        commit: commit
      })
    }

    let localState = this.store.get('editorState')
    let localEditorState
    if (localState) {
      try {
        localEditorState = Raw.deserialize(localState, {
          terse: true
        })
      } catch (e) {
        console.log('parsing error', e)
      }
    }

    if (localEditorState) {
      this.beginChanges(repo.id)
      this.setState({
        editorState: localEditorState,
        committedEditorState
      })
    } else {
      this.concludeChanges(repo.id)
      this.setState({
        editorState: committedEditorState,
        committedEditorState
      })
    }
  }

  changeHandler (newEditorState) {
    this.setState({ editorState: newEditorState })
  }

  documentChangeHandler (_, newEditorState) {
    const { data: { repo } } = this.props
    const { committedEditorState, uncommittedChanges } = this.state

    if (
      !newEditorState.document.equals(committedEditorState.document)
    ) {
      this.store.set('editorState', Raw.serialize(newEditorState, {
        terse: true
      }))

      if (!uncommittedChanges) {
        this.beginChanges(repo.id)
      }
    } else {
      if (uncommittedChanges) {
        this.store.clear()
        this.concludeChanges(repo.id)
      }
    }
  }

  commitHandler () {
    const {
      data: { repo },
      url,
      commitMutation
    } = this.props
    const { editorState } = this.state

    const message = window.prompt('Commit message:')
    if (!message) {
      return
    }
    this.setState({
      committing: true
    })

    commitMutation({
      repoId: repo.id,
      parentId: url.query.commit,
      message: message,
      document: {
        content: serializer.serialize(editorState, {
          mdast: true
        })
      }
    })
      .then(({data}) => {
        this.store.clear()
        this.concludeChanges(repo.id)

        this.setState({
          committing: false,
          uncommittedChanges: false
        })
        Router.replaceRoute('editor/edit', {
          repository: url.query.repository,
          commit: data.commit.id
        })
      })
      .catch(e => {
        console.log('commit catched')
        console.log(e)
      })
  }

  render () {
    const { url, t } = this.props
    const { repository, commit } = url.query
    const { loading, error, repo } = this.props.data
    const {
      editorState,
      committing,
      uncommittedChanges,
      localStorageUnavailable,
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
              {localStorageUnavailable &&
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
              <Label>{t('checklist/title')}</Label>
              <Checklist
                disabled={!!uncommittedChanges}
                repoId={`orbiting/${repository}`}
                commitId={commit}
              />
              <Label>{t('commitHistory/title')}</Label>
              <CommitHistory
                commits={repo.commits}
                repository={repository}
              />
              <Label>{t('uncommittedChanges/title')}</Label>
              <UncommittedChanges repoId={repo.id} />
            </EditSidebar>
          </div>
        )} />
      </Frame>
    )
  }
}

export default compose(
  withData,
  withT,
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
          update: (proxy, { data: { commit } }) => {
            const variables = {
              repoId: 'orbiting/' + url.query.repository
            }
            const data = proxy.readQuery({
              query,
              variables
            })
            data.repo.commits = [
              commit,
              ...data.repo.commits
            ]
            proxy.writeQuery({
              query: query,
              variables,
              data
            })
          }
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
