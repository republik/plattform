import React, { Component } from 'react'
import { withRouter } from 'next/router'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { Value, resetKeyGenerator } from 'slate'
import debounce from 'lodash.debounce'

import withAuthorization from '../../components/Auth/withAuthorization'

import Frame from '../../components/Frame'
import { HEADER_HEIGHT } from '../../components/Frame/constants'
import RepoNav from '../../components/Repo/Nav'
import RepoArchivedBanner from '../../components/Repo/ArchivedBanner'

import Editor from '../../components/editor'
import EditorUI from '../../components/editor/UI'

import VersionControl from '../../components/VersionControl'
import BranchingNotice from '../../components/VersionControl/BranchingNotice'
import CommitButton from '../../components/VersionControl/CommitButton'
import {
  UncommittedChanges,
  withUncommitedChanges,
  ActiveInterruptionOverlay,
  warningColor,
  joinUsers
} from '../../components/VersionControl/UncommittedChanges'
import Sidebar from '../../components/Sidebar'
import Warning from '../../components/Sidebar/Warning'

import Loader from '../../components/Loader'
import CharCount from '../../components/CharCount'
import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import { Router } from '../../lib/routes'

import { errorToString } from '../../lib/utils/errors'
import initLocalStore from '../../lib/utils/localStorage'

import { getSchema } from '../../components/Templates'
import { API_UNCOMMITTED_CHANGES_URL } from '../../lib/settings'
import * as fragments from '../../lib/graphql/fragments'

import { colors } from '@project-r/styleguide'
import SettingsIcon from 'react-icons/lib/fa/cogs'

import createDebug from 'debug'

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
      ...CommitWithDocument
      repo {
        ...EditPageRepo
      }
    }
  }
  ${fragments.CommitWithDocument}
  ${fragments.EditPageRepo}
`

const uncommittedChangesMutation = gql`
  mutation uncommittedChanges($repoId: ID!, $action: Action!) {
    uncommittedChanges(repoId: $repoId, action: $action)
  }
`

const getCommitById = gql`
  query getCommitById($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      ...EditPageRepo
      commit(id: $commitId) {
        ...CommitWithDocument
      }
    }
  }
  ${fragments.EditPageRepo}
  ${fragments.CommitWithDocument}
`

const getLatestCommit = gql`
  query getLatestCommit($repoId: ID!) {
    repo(id: $repoId) {
      id
      latestCommit {
        ...SimpleCommit
      }
    }
  }
  ${fragments.SimpleCommit}
`

const getRepoHistory = gql`
  query repoWithHistory($repoId: ID!, $first: Int!, $after: String) {
    repo(id: $repoId) {
      id
      commits(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...SimpleCommit
        }
      }
      milestones {
        ...SimpleMilestone
      }
    }
  }
  ${fragments.SimpleMilestone}
  ${fragments.SimpleCommit}
`

const debug = createDebug('publikator:pages:edit')
const TEST = process.env.NODE_ENV === 'test'

const addWarning = message => state => ({
  showSidebar: true,
  warnings: [message, ...state.warnings].filter(
    // de-dup
    (message, i, all) => all.indexOf(message) === i
  )
})

const rmWarning = message => state => ({
  warnings: state.warnings.filter(warning => warning !== message)
})

const SIDEBAR_ICON_SIZE = 30

export class EditorPage extends Component {
  constructor(...args) {
    super(...args)

    this.toggleSidebarHandler = event => {
      event.preventDefault()
      this.setState(state => ({
        showSidebar: !state.showSidebar
      }))
    }
    this.changeHandler = this.changeHandler.bind(this)
    this.commitHandler = this.commitHandler.bind(this)
    this.documentChangeHandler = debounce(
      this.documentChangeHandler.bind(this),
      500
    )
    this.uiChangeHandler = change => {
      this.changeHandler(change)
      this.documentChangeHandler(null, change)
    }
    this.revertHandler = e => {
      e.preventDefault()
      const { t } = this.props
      if (!window.confirm(t('revert/confirm'))) {
        return
      }
      this.setState({
        didUnlock: false,
        acknowledgedUsers: []
      })
      this.store.clear()
      this.loadState(this.props)
    }

    this.editorRef = ref => {
      this.editor = ref
      if (ref) {
        this.forceUpdate()
      }
    }

    this.state = {
      committing: false,
      editorState: null,
      repo: null,
      hasUncommittedChanges: null,
      warnings: [],
      acknowledgedUsers: [],
      activeUsers: [],
      showSidebar: true,
      readOnly: true
    }

    this.lock = state => {
      const { t } = this.props
      const warning = t('commit/warn/canNotLock')
      if (state.hasUncommittedChanges) {
        return addWarning(warning)(state)
      }

      return {
        readOnly: true,
        ...rmWarning(warning)(state)
      }
    }
    this.unlock = state => {
      return {
        readOnly: false
      }
    }
    this.lockHandler = event => {
      event && event.preventDefault()
      this.setState({
        didUnlock: false
      })
      if (this.state.hasUncommittedChanges) {
        console.warn(
          'lockHandler should not be called when user has uncommitted changes'
        )
        return
      }
      this.notifyChanges('delete')
      this.setState(this.lock)
    }
    this.unlockHandler = event => {
      event && event.preventDefault()
      const { t } = this.props

      const { activeUsers } = this.state

      if (
        !window.confirm(
          t.pluralize('uncommittedChanges/unlock/confirm', {
            count: activeUsers.length,
            activeUsers: joinUsers(activeUsers, t)
          })
        )
      ) {
        return
      }

      this.setState(
        {
          didUnlock: true,
          acknowledgedUsers: this.state.activeUsers,
          readOnly: false
        },
        () => {
          this.notifyChanges('create')
        }
      )
      this.setState(this.unlock)
    }
    this.beforeunload = event => {
      const {
        router: {
          query: { repoId }
        }
      } = this.props
      const { hasUncommittedChanges, didUnlock } = this.state
      if (!hasUncommittedChanges && didUnlock) {
        this.notifyChanges('delete')
        if (event) {
          try {
            navigator.sendBeacon(
              API_UNCOMMITTED_CHANGES_URL,
              JSON.stringify({
                repoId,
                action: 'delete'
              })
            )
          } catch (e) {}
        }
      }
    }
  }

  notifyChanges(action) {
    debug('notifyChanges', action)
    const {
      router: {
        query: { repoId }
      },
      t
    } = this.props

    const warning = t('commit/warn/uncommittedChangesError')
    this.props
      .hasUncommitedChanges({
        repoId,
        action
      })
      .then(() => {
        this.setState(rmWarning(warning))
      })
      .catch(error => {
        console.error(error)
        this.setState(addWarning(warning))
      })
  }

  beginChanges() {
    this.setState({
      hasUncommittedChanges: true,
      beginChanges: new Date(),
      readOnly: false
    })

    this.notifyChanges('create')
  }

  concludeChanges(notify = true) {
    this.setState({
      hasUncommittedChanges: false
    })

    if (notify) {
      this.notifyChanges('delete')
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const emptyRepo = {}
    const { repo = emptyRepo, loading } = this.props.data || {}
    const { repo: nextRepo = emptyRepo, loading: nextLoading } =
      nextProps.data || {}

    const shouldLoad =
      repo !== nextRepo ||
      repo.commit !== nextRepo.commit ||
      loading !== nextLoading
    debug('componentWillReceiveProps', 'shouldLoad', shouldLoad)
    if (shouldLoad) {
      this.loadState(nextProps)
    } else {
      const { uncommittedChanges } = this.props
      const { uncommittedChanges: nextUncommittedChanges } = nextProps
      const shouldUpdateActiveUsers =
        uncommittedChanges.users !== nextUncommittedChanges.users
      debug(
        'componentWillReceiveProps',
        'shouldUpdateActiveUsers',
        shouldUpdateActiveUsers
      )
      if (shouldUpdateActiveUsers) {
        this.updateActiveUsers(nextProps)
      }
    }
  }

  updateActiveUsers(props) {
    const {
      uncommittedChanges: { users },
      me
    } = props

    this.setState(state => {
      const activeUsers = users.filter(user => user.id !== me.id)
      const acknowledgedUsers = state.acknowledgedUsers

      let addToState = {}
      const newUsers = activeUsers.filter(
        user => !acknowledgedUsers.find(ack => ack.id === user.id)
      )
      if (newUsers.length) {
        if (state.hasUncommittedChanges || state.didUnlock) {
          addToState = {
            interruptingUsers: newUsers
          }
        } else {
          addToState = this.lock(state)
        }
      } else {
        if (state.readOnly && !activeUsers.length) {
          addToState = this.unlock(state)
        }
      }
      if (!addToState.interruptingUsers && state.interruptingUsers) {
        addToState = {
          ...addToState,
          interruptingUsers: undefined
        }
      }

      debug('updateActiveUsers', addToState, {
        activeUsers,
        acknowledgedUsers
      })
      return {
        ...addToState,
        activeUsers,
        acknowledgedUsers
      }
    })
  }

  checkLocalStorageSupport() {
    const { t } = this.props
    if (process.browser && this.store && !this.store.supported) {
      this.setState(addWarning(t('commit/warn/noStorage')))
    }
  }
  componentDidMount() {
    resetKeyGenerator()
    this.loadState(this.props)
    window.addEventListener('beforeunload', this.beforeunload)
  }
  componentWillUnmount() {
    this.beforeunload()
    window.removeEventListener('beforeunload', this.beforeunload)
  }

  loadState(props) {
    const { t, data: { loading, error, repo } = {}, router } = props

    if (!process.browser && !TEST) {
      // running without local storage doesn't make sense
      // - we always want to render the correct version
      // - flash of an outdated version could confuse an user
      // - if js loading fails or is disabled no editing should happen
      //   - server rendered native content editable edits are not recoverable
      console.warn(`loadState should only run in the browser`)
      return
    }
    if (loading || error) {
      debug('loadState', 'isLoading', loading, 'hasError', error)
      return
    }
    const repoId = router.query.repoId
    const commitId = router.query.commitId
    if (!commitId && repo && repo.latestCommit) {
      debug('loadState', 'redirect', repo.latestCommit)
      Router.replaceRoute('repo/edit', {
        repoId: repoId.split('/'),
        commitId: repo.latestCommit.id
      })
      return
    }

    const { schema } = this.state
    if (!schema) {
      const commit = repo && repo.commit

      const template =
        (commit && commit.document.meta.template) || router.query.template
      debug('loadState', 'loadSchema', template)
      this.setState(
        {
          schema: getSchema(template)
        },
        () => {
          this.loadState(this.props)
        }
      )
      return
    }
    if (!this.editor || !this.editor.slate) {
      debug('loadState', 'waiting for slate')
      return
    }

    const isNew = commitId === 'new'
    let committedEditorState
    if (isNew) {
      committedEditorState = this.editor.newDocument(
        router.query,
        this.props.me
      )
      debug('loadState', 'new document', committedEditorState)
    } else {
      const commit = repo.commit
      if (!commit) {
        this.setState({
          error: t('commit/warn/missing', { commitId })
        })
        return
      }

      const json = {
        ...commit.document.content,
        // add format to root mdast node
        format: commit.document.meta.format
      }

      committedEditorState = this.editor.serializer.deserialize(json)

      // normalize
      const normalizedState = committedEditorState
        .change()
        .setValue({ schema: this.editor.slate.schema })
        .normalize().value

      if (normalizedState.document !== committedEditorState.document) {
        debug('loadState', 'normalize committed document', committedEditorState)
        committedEditorState = normalizedState
      }

      debug('loadState', 'edit document', committedEditorState)
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
        if (typeof localState.kind !== 'undefined') {
          localEditorState = Value.fromJSON(localState)
          debug('loadState', 'using local slate document', localEditorState)
        } else {
          localEditorState = this.editor.serializer.deserialize(localState)
          debug('loadState', 'using local mdast document', localEditorState)
        }
      } catch (e) {
        console.error(e)
        this.setState(addWarning(t('commit/warn/localParseError')))
      }
    }

    const nextState = {
      committedRawDocString
    }
    if (localEditorState) {
      this.beginChanges()
      nextState.editorState = localEditorState
    } else {
      this.concludeChanges()
      nextState.editorState = committedEditorState
    }
    this.setState(nextState, () => {
      this.updateActiveUsers(this.props)
    })
  }

  changeHandler({ value }) {
    this.setState({ editorState: value })
  }

  documentChangeHandler(_, { value: newEditorState }) {
    const { committedRawDocString, hasUncommittedChanges } = this.state

    if (
      JSON.stringify(newEditorState.document.toJSON()) !== committedRawDocString
    ) {
      this.store.set(
        'editorState',
        this.editor.serializer.serialize(newEditorState)
      )
      debug(
        'loadState',
        'documentChangeHandler',
        'edited document',
        newEditorState
      )
      if (process.env.NODE_ENV !== 'production') {
        debug(
          'loadState',
          'documentChangeHandler',
          'diff',
          require('diff').createPatch(
            'string',
            JSON.stringify(JSON.parse(committedRawDocString), null, 2),
            JSON.stringify(newEditorState.document.toJSON(), null, 2)
          )
        )
      }

      const msSinceBegin =
        this.state.beginChanges &&
        new Date().getTime() - this.state.beginChanges.getTime()
      const { uncommittedChanges, me } = this.props
      if (
        !hasUncommittedChanges ||
        msSinceBegin > 1000 * 60 * 5 ||
        (!uncommittedChanges.users.find(user => user.id === me.id) &&
          (!msSinceBegin || msSinceBegin > 1000))
      ) {
        this.beginChanges()
      }
    } else {
      debug('loadState', 'documentChangeHandler', 'committed document')
      if (hasUncommittedChanges) {
        this.store.clear()
        this.concludeChanges(!this.state.didUnlock)
      }
    }
  }

  commitHandler() {
    const {
      router: {
        query: { repoId, commitId }
      },
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
      parentId: commitId === 'new' ? null : commitId,
      message: message,
      document: {
        content: this.editor.serializer.serialize(editorState)
      }
    })
      .then(({ data }) => {
        this.store.clear()
        this.concludeChanges()

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
        this.setState(state => ({
          committing: false,
          ...addWarning(
            t('commit/warn/failed', {
              error: errorToString(e)
            })
          )(state)
        }))
      })
  }

  render() {
    const { router, data = {}, uncommittedChanges, t } = this.props
    const { repoId, commitId } = router.query
    const { loading, repo } = data
    const {
      schema,
      editorState,
      committing,
      hasUncommittedChanges,
      warnings,
      showSidebar,
      readOnly,
      activeUsers,
      interruptingUsers,
      didUnlock
    } = this.state

    const isNew = commitId === 'new'
    const error = data.error || this.state.error
    const showLoading = committing || loading || (!schema && !error)

    const sidebarPrependChildren = [
      ...warnings
        .filter(Boolean)
        .map((m, i) => <Warning key={`warning-${i}`} message={m} />),
      !showLoading && repo && (
        <BranchingNotice
          key='branching-notice'
          repoId={repo.id}
          currentCommitId={commitId}
        />
      ),
      !showLoading && repo && repo.isArchived && <RepoArchivedBanner />
    ].filter(Boolean)
    const sidebarDisabled = !!(showLoading || error)

    return (
      <Frame raw>
        <Frame.Header
          barStyle={{
            borderBottom: activeUsers.length
              ? `3px solid ${readOnly ? colors.error : warningColor}`
              : undefined
          }}
        >
          <Frame.Header.Section align='left'>
            <Frame.Nav>
              <RepoNav route='repo/edit' isNew={isNew} />
            </Frame.Nav>
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            <div
              style={{
                padding: 25,
                paddingTop: 30,
                // 1 px header border
                paddingBottom: HEADER_HEIGHT - SIDEBAR_ICON_SIZE - 30 - 1,
                cursor: 'pointer',
                color: showSidebar ? colors.primary : undefined
              }}
              onMouseDown={this.toggleSidebarHandler}
            >
              <SettingsIcon size={SIDEBAR_ICON_SIZE} />
            </div>
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            <CommitButton
              isNew={isNew}
              readOnly={!showLoading && readOnly}
              didUnlock={didUnlock}
              hasUncommittedChanges={!showLoading && hasUncommittedChanges}
              onUnlock={this.unlockHandler}
              onLock={this.lockHandler}
              onCommit={this.commitHandler}
              onRevert={this.revertHandler}
            />
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            {!showLoading && !!repo && (
              <BranchingNotice
                asIcon
                repoId={repo.id}
                currentCommitId={commitId}
              />
            )}
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            {!!repo && (
              <UncommittedChanges
                uncommittedChanges={uncommittedChanges}
                t={t}
              />
            )}
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            <Frame.Me />
          </Frame.Header.Section>
        </Frame.Header>
        <Frame.Body raw>
          <Loader
            loading={showLoading}
            error={error}
            render={() => (
              <div>
                {interruptingUsers && (
                  <ActiveInterruptionOverlay
                    uncommittedChanges={uncommittedChanges}
                    interruptingUsers={interruptingUsers}
                    onRevert={this.revertHandler}
                    onAcknowledged={() =>
                      this.setState({
                        acknowledgedUsers: this.state.activeUsers,
                        interruptingUsers: undefined
                      })
                    }
                  />
                )}
                <Editor
                  ref={this.editorRef}
                  schema={schema}
                  meta={repo ? repo.meta : {}}
                  value={editorState}
                  onChange={this.changeHandler}
                  onDocumentChange={this.documentChangeHandler}
                  readOnly={readOnly}
                />
              </div>
            )}
          />
          <Sidebar
            prependChildren={sidebarPrependChildren}
            isDisabled={sidebarDisabled}
            selectedTabId={readOnly ? 'workflow' : 'edit'}
            isOpen={showSidebar}
          >
            {!readOnly && (
              <Sidebar.Tab tabId='edit' label='Editieren'>
                <CharCount value={editorState} />
                {!!this.editor && (
                  <EditorUI
                    editorRef={this.editor}
                    onChange={this.uiChangeHandler}
                    value={editorState}
                  />
                )}
              </Sidebar.Tab>
            )}
            <Sidebar.Tab tabId='workflow' label='Workflow'>
              <div style={{ marginBottom: 10 }}>
                <CharCount value={editorState} />
              </div>
              <VersionControl
                repoId={repoId}
                commit={repo && (repo.commit || repo.latestCommit)}
                isNew={isNew}
                hasUncommittedChanges={hasUncommittedChanges}
              />
            </Sidebar.Tab>
          </Sidebar>
        </Frame.Body>
      </Frame>
    )
  }
}

export default compose(
  withRouter,
  withT,
  withAuthorization(['editor']),
  withMe,
  graphql(getCommitById, {
    skip: ({ router }) =>
      router.query.commitId === 'new' || !router.query.commitId,
    options: ({ router }) => ({
      variables: {
        repoId: router.query.repoId,
        commitId: router.query.commitId
      }
    })
  }),
  graphql(getLatestCommit, {
    skip: ({ router }) =>
      !!router.query.commitId && router.query.commitId !== 'new',
    options: ({ router }) => ({
      // always the latest
      fetchPolicy: 'network-only',
      variables: {
        repoId: router.query.repoId
      }
    }),
    props: ({ data, ownProps: { router, t } }) => {
      if (router.query.commitId === 'new') {
        if (data.repo && data.repo.latestCommit) {
          return {
            data: {
              error: t('repo/add/alreadyExists')
            }
          }
        }
        return {}
      }
      return {
        data
      }
    }
  }),
  withUncommitedChanges({
    options: ({ router }) => ({
      variables: {
        repoId: router.query.repoId
      }
    })
  }),
  graphql(commitMutation, {
    props: ({ mutate, ownProps: { router } }) => ({
      commitMutation: variables =>
        mutate({
          variables,
          update: (store, { data: { commit } }) => {
            const { repoId, parentId } = variables
            let data
            if (parentId) {
              const oldData = store.readQuery({
                query: getCommitById,
                variables: {
                  repoId,
                  commitId: parentId
                }
              })
              data = {
                ...oldData,
                repo: {
                  ...oldData.repo,
                  commit
                }
              }
            } else {
              data = {
                repo: {
                  ...commit.repo,
                  commit
                }
              }
            }
            store.writeQuery({
              query: getCommitById,
              variables: {
                repoId,
                commitId: commit.id
              },
              data
            })
          },
          refetchQueries: [
            {
              query: getRepoHistory,
              variables: {
                repoId: router.query.repoId,
                first: 20
              }
            }
          ]
        })
    })
  }),
  graphql(uncommittedChangesMutation, {
    props: ({ mutate }) => ({
      hasUncommitedChanges: variables =>
        mutate({
          variables
        })
    })
  })
)(EditorPage)
