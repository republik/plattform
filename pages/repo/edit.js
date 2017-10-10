import React, { Component } from 'react'
import { compose } from 'redux'
import { Router } from '../../lib/routes'
import withData from '../../lib/apollo/withData'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { State, resetKeyGenerator } from 'slate'
import { A, Button, Label } from '@project-r/styleguide'

import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import Editor, { serializer, newDocument } from '../../components/editor/NewsletterEditor'

import EditSidebar from '../../components/EditSidebar'
import Loader from '../../components/Loader'
import BaseCommit from '../../components/EditSidebar/BaseCommit'
import Checklist from '../../components/EditSidebar/Checklist'
import CommitHistory from '../../components/EditSidebar/CommitHistory'
import UncommittedChanges from '../../components/EditSidebar/UncommittedChanges'
import withAuthorization from '../../components/Auth/withAuthorization'
import withT from '../../lib/withT'

import { errorToString } from '../../lib/utils/errors'
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
        meta {
          title
        }
      }
    }
  `
}

const getCommitById = gql`
  query getCommitById($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      id
      commit(id: $commitId) {
        ...EditPageCommit
      }
    }
  }
  ${fragments.commit}
`

const getLatestCommit = gql`
  query getLatestCommit($repoId: ID!) {
    repo(id: $repoId) {
      id
      latestCommit {
        id
      }
    }
  }
`

const commitMutation = gql`
  mutation commit(
    $repoId: ID!
    $parentId: ID
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
    color: 'red',
    marginBottom: 10
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
      uncommittedChanges: null,
      warnings: []
    }
  }

  warn (message) {
    this.setState(state => ({
      warnings: [
        message,
        ...state.warnings
      ].filter( // de-dup
        (message, i, all) => all.indexOf(message) === i
      )
    }))
  }

  beginChanges (repoId) {
    const { t } = this.props
    this.setState({
      uncommittedChanges: true
    })
    this.props.uncommittedChangesMutation({
      repoId: repoId,
      action: 'create'
    }).catch(error => {
      console.error(error)
      this.warn(t('commit/warn/uncommittedChangesError'))
    })
  }

  concludeChanges (repoId) {
    const { t } = this.props
    this.setState({
      uncommittedChanges: false
    })
    this.props.uncommittedChangesMutation({
      repoId: repoId,
      action: 'delete'
    }).catch(error => {
      console.error(error)
      this.warn(t('commit/warn/uncommittedChangesError'))
    })
  }

  componentWillReceiveProps (nextProps) {
    const { repo = {} } = this.props.data
    const { repo: nextRepo = {} } = nextProps.data

    if (
      repo !== nextRepo ||
      repo.commit !== nextRepo.commit
    ) {
      this.loadState(nextProps)
    }
  }

  checkLocalStorageSupport () {
    const { t } = this.props
    if (
      process.browser &&
      this.store &&
      !this.store.supported
    ) {
      this.warn(t('commit/warn/noStorage'))
    }
  }
  componentDidMount () {
    resetKeyGenerator()
    this.loadState(this.props)
  }

  revertHandler (e) {
    e.preventDefault()
    this.store.clear()
    this.loadState(this.props)
  }

  loadState (props) {
    const {
      t,
      data: { loading, error, repo } = {},
      url
    } = props

    if (!process.browser) {
      // running without local storage doesn't make sense
      // - we always want to render the correct version
      // - flash of an outdated version could confuse an user
      // - if js loading fails or is disabled no editing should happen
      //   - server rendered native content editable edits are not recoverable
      console.warn(`loadState should only run in the browser`)
      return
    }
    if (loading || error) {
      return
    }
    if (!url.query.commitId && repo && repo.latestCommit) {
      Router.replaceRoute('repo/edit', {
        repoId: url.query.repoId.split('/'),
        commitId: repo.latestCommit.id
      })
      return
    }
    const repoId = url.query.repoId
    const commitId = url.query.commitId

    const isNew = commitId === 'new'
    let committedEditorState
    if (isNew) {
      committedEditorState = newDocument(url.query)
    } else {
      const commit = repo.commit
      if (!commit) {
        this.setState({
          error: t('commit/warn/missing', {commitId})
        })
        return
      }

      const json = commit.document.content
      committedEditorState = serializer.deserialize(json, {
        mdast: true
      })
    }
    const committedRawDocString = JSON.stringify(
      committedEditorState.document.toJSON()
    )

    const storeKey = [repoId, commitId].join('/')
    if (!this.store || this.store.key !== storeKey) {
      this.store = initLocalStore(storeKey)
      this.checkLocalStorageSupport()
    }

    let localState = this.store.get('editorState')
    let localEditorState
    if (localState) {
      try {
        localEditorState = State.fromJSON(localState)
      } catch (e) {
        console.error(e)
        this.warn(t('commit/warn/localParseError'))
      }
    }

    if (localEditorState) {
      this.beginChanges(repoId)
      this.setState({
        editorState: localEditorState,
        committedRawDocString
      })
    } else {
      this.concludeChanges(repoId)
      this.setState({
        editorState: committedEditorState,
        committedRawDocString
      })
    }
  }

  changeHandler ({state}) {
    this.setState({ editorState: state })
  }

  documentChangeHandler (_, {state: newEditorState}) {
    const { url: { query: { repoId } } } = this.props
    const { committedRawDocString, uncommittedChanges } = this.state

    if (
      JSON.stringify(newEditorState.document.toJSON()) !== committedRawDocString
    ) {
      this.store.set('editorState', newEditorState.toJSON())

      if (!uncommittedChanges) {
        this.beginChanges(repoId)
      }
    } else {
      if (uncommittedChanges) {
        this.store.clear()
        this.concludeChanges(repoId)
      }
    }
  }

  commitHandler () {
    const {
      url: { query: { repoId, commitId } },
      commitMutation,
      t
    } = this.props
    const { editorState } = this.state

    const message = window.prompt(t('commit/promtMessage'))
    if (!message) {
      return
    }
    this.setState({
      committing: true
    })

    commitMutation({
      repoId,
      parentId: commitId === 'new'
        ? null
        : commitId,
      message: message,
      document: {
        content: serializer.serialize(editorState, {
          mdast: true
        })
      }
    })
      .then(({data}) => {
        this.store.clear()
        this.concludeChanges(repoId)

        this.setState({
          committing: false
        })
        Router.replaceRoute('repo/edit', {
          repoId: repoId.split('/'),
          commitId: data.commit.id
        })
      })
      .catch(e => {
        console.error(e)
        this.setState({
          committing: false
        })
        this.warn(t('commit/warn/failed', {
          error: errorToString(e)
        }))
      })
  }

  render () {
    const { url, t, data = {} } = this.props
    const { repoId, commitId } = url.query
    const { loading, repo } = data
    const {
      editorState,
      committing,
      uncommittedChanges,
      warnings
    } = this.state
    const sidebarWidth = 200

    const isNew = commitId === 'new'
    const error = data.error || this.state.error
    const showLoading = committing || loading || (!editorState && !error)

    return (
      <Frame url={url} raw nav={<RepoNav route='repo/edit' url={url} isNew={isNew} />}>
        <Loader loading={showLoading} error={error} render={() => (
          <div>
            <div style={{paddingRight: sidebarWidth}}>
              <Editor
                state={editorState}
                onChange={this.changeHandler}
                onDocumentChange={this.documentChangeHandler}
              />
            </div>
            <EditSidebar width={sidebarWidth}>
              {warnings.map((message, i) => (
                <div key={i} {...css(styles.danger)}>
                  {message}
                </div>
              ))}
              {!!repo &&
                <BaseCommit repoId={repoId} commitId={commitId} />}
              <div {...css(styles.uncommittedChanges)}>
                <div style={{marginBottom: 10}}>
                  <Label style={{fontSize: 12}}>
                    <span>
                      {isNew
                        ? t('commit/status/new')
                        : t(uncommittedChanges
                              ? 'commit/status/uncommitted'
                              : 'commit/status/committed')
                      }
                    </span>
                  </Label>
                </div>

                <Button
                  primary
                  block
                  disabled={!uncommittedChanges && !isNew}
                  onClick={this.commitHandler}
                  style={styles.button}
                >
                  {t('commit/button')}
                </Button>

                {!!uncommittedChanges && (
                  <div style={{textAlign: 'center', marginTop: 10}}>
                    <A href='#' onClick={this.revertHandler}>
                      {t('commit/revert')}
                    </A>
                  </div>
                )}
              </div>

              {!!repo && (
                <div>
                  <Label>{t('checklist/title')}</Label>
                  <Checklist
                    disabled={!!uncommittedChanges}
                    repoId={repoId}
                    commitId={commitId}
                  />
                  <Label>{t('commitHistory/title')}</Label>
                  <CommitHistory
                    repoId={repoId}
                    commitId={commitId}
                  />
                </div>
              )}
              <Label>{t('uncommittedChanges/title')}</Label>
              <UncommittedChanges repoId={repoId} />
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
  graphql(getCommitById, {
    skip: ({ url }) => url.query.commitId === 'new' || !url.query.commitId,
    options: ({ url }) => ({
      variables: {
        repoId: url.query.repoId,
        commitId: url.query.commitId
      }
    })
  }),
  graphql(getLatestCommit, {
    skip: ({ url }) => url.query.commitId === 'new' || !!url.query.commitId,
    options: ({ url }) => ({
      variables: {
        repoId: url.query.repoId
      }
    })
  }),
  graphql(commitMutation, {
    props: ({ mutate, ownProps: { url } }) => ({
      commitMutation: variables =>
        mutate({
          variables,
          update: (proxy, { data: { commit } }) => {
            const oldData = proxy.readQuery({
              query: getCommitById,
              variables: {
                repoId: url.query.repoId,
                commitId: url.query.commitId
              }
            })
            const data = {
              ...oldData,
              repo: {
                ...oldData.repo,
                commit
              }
            }
            proxy.writeQuery({
              query: getCommitById,
              variables: {
                repoId: url.query.repoId,
                commitId: commit.id
              },
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
