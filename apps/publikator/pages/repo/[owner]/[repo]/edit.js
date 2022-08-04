import { Component } from 'react'
import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { Value, resetKeyGenerator } from 'slate'
import debounce from 'lodash/debounce'
import { timeFormat } from 'd3-time-format'
import { parse } from '@orbiting/remark-preset'

import withAuthorization from '../../../../components/Auth/withAuthorization'

import Frame from '../../../../components/Frame'
import { HEADER_HEIGHT } from '../../../../components/Frame/constants'
import RepoNav from '../../../../components/Repo/Nav'
import RepoArchivedBanner from '../../../../components/Repo/ArchivedBanner'

import Editor from '../../../../components/editor'
import EditorUI from '../../../../components/editor/UI'

import VersionControl from '../../../../components/VersionControl'
import BranchingNotice from '../../../../components/VersionControl/BranchingNotice'
import CommitButton from '../../../../components/VersionControl/CommitButton'
import {
  UncommittedChanges,
  withUncommitedChanges,
  ActiveInterruptionOverlay,
  warningColor,
  joinUsers,
  withUncommittedChangesMutation,
} from '../../../../components/VersionControl/UncommittedChanges'
import Sidebar from '../../../../components/Sidebar'
import Warning from '../../../../components/Sidebar/Warning'
import ScreenSizePicker from '../../../../components/ScreenSizePicker'
import PreviewFrame from '../../../../components/PreviewFrame'

import Loader from '../../../../components/Loader'
import CharCount from '../../../../components/CharCount'
import withT from '../../../../lib/withT'
import withMe from '../../../../lib/withMe'

import { errorToString } from '../../../../lib/utils/errors'
import initLocalStore from '../../../../lib/utils/localStorage'

import { getSchema } from '../../../../components/Templates'
import { API_UNCOMMITTED_CHANGES_URL } from '../../../../lib/settings'
import * as fragments from '../../../../lib/graphql/fragments'

import {
  ColorContextProvider,
  colors,
  plainButtonRule,
  Interaction,
  Checkbox,
} from '@project-r/styleguide'
import { FaCogs as SettingsIcon } from 'react-icons/fa'

import createDebug from 'debug'
import {
  findAuthorsP,
  findTitleLeaf,
  generateAuthorsLine,
} from '../../../../lib/utils/helpers'
import { withEditRepoMeta } from '../../../../components/Repo/EditMetaDate'
import { getRepoIdFromQuery } from '../../../../lib/repoIdHelper'
import { gql } from '@apollo/client'
import { withDefaultSSR } from '../../../../lib/apollo/helpers'

const commitMutation = gql`
  mutation commit(
    $repoId: ID!
    $parentId: ID
    $message: String!
    $document: DocumentInput!
    $isTemplate: Boolean
  ) {
    commit(
      repoId: $repoId
      parentId: $parentId
      message: $message
      document: $document
      isTemplate: $isTemplate
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

const getTemplateById = gql`
  query getLatestCommit($repoId: ID!) {
    templateRepo: repo(id: $repoId) {
      id
      latestCommit {
        ...CommitWithDocument
      }
    }
  }
  ${fragments.CommitWithDocument}
`

const debug = createDebug('publikator:pages:edit')
const TEST = process.env.NODE_ENV === 'test'

const formatTime = timeFormat('%H:%M')
const addWarning = (message) => {
  const time = formatTime(new Date())
  return (state) => {
    return {
      showSidebar: true,
      warnings: [{ time, message }, ...state.warnings].filter(
        // de-dup
        ({ message }, i, all) =>
          all.findIndex((w) => w.message === message) === i,
      ),
    }
  }
}

const rmWarning = (message) => (state) => ({
  warnings: state.warnings.filter((warning) => warning.message !== message),
})

const SIDEBAR_ICON_SIZE = 30

export class EditorPage extends Component {
  constructor(...args) {
    super(...args)

    this.toggleSidebarHandler = (event) => {
      event.preventDefault()
      this.setState((state) => ({
        showSidebar: !state.showSidebar,
      }))
    }
    this.changeHandler = this.changeHandler.bind(this)
    this.commitHandler = this.commitHandler.bind(this)
    this.goToRaw = this.goToRaw.bind(this)
    this.documentChangeHandler = debounce(
      this.documentChangeHandler.bind(this),
      500,
    )
    this.uiChangeHandler = (change) => {
      this.changeHandler(change)
      this.documentChangeHandler(null, change)
    }
    this.revertHandler = (e) => {
      e.preventDefault()
      const { t } = this.props
      if (!window.confirm(t('revert/confirm'))) {
        return
      }
      this.setState({
        didUnlock: false,
        acknowledgedUsers: [],
        previewScreenSize: null,
      })
      this.store.clear()
      this.loadState(this.props)
    }

    this.editorRef = (ref) => {
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
      readOnly: true,
      previewScreenSize: null,
      previewDarkmode: false,
    }

    this.lock = (state) => {
      const { t } = this.props
      const warning = t('commit/warn/canNotLock')
      if (state.hasUncommittedChanges) {
        return addWarning(warning)(state)
      }

      return {
        readOnly: true,
        ...rmWarning(warning)(state),
      }
    }
    this.unlock = () => {
      return {
        readOnly: false,
      }
    }
    this.lockHandler = (event) => {
      event && event.preventDefault()
      this.setState({
        didUnlock: false,
      })
      if (this.state.hasUncommittedChanges) {
        console.warn(
          'lockHandler should not be called when user has uncommitted changes',
        )
        return
      }
      this.notifyChanges('delete')
      this.setState(this.lock)
    }
    this.unlockHandler = (event) => {
      event && event.preventDefault()
      const { t } = this.props

      const { activeUsers } = this.state

      if (
        !window.confirm(
          t.pluralize('uncommittedChanges/unlock/confirm', {
            count: activeUsers.length,
            activeUsers: joinUsers(activeUsers, t),
          }),
        )
      ) {
        return
      }

      this.setState(
        {
          didUnlock: true,
          acknowledgedUsers: this.state.activeUsers,
          readOnly: false,
        },
        () => {
          this.notifyChanges('create')
        },
      )
      this.setState(this.unlock)
    }
    this.beforeunload = (event) => {
      const {
        router: {
          query: { repoId },
        },
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
                action: 'delete',
              }),
            )
            // eslint-disable-next-line no-empty
          } catch (e) {}
        }
      }
    }
  }

  notifyChanges(action) {
    const {
      router: {
        query: { repoId, commitId },
      },
      t,
    } = this.props

    // we don't notify the backend if no backend repo exists
    if (commitId === 'new') return

    debug('notifyChanges', action)

    const warning = t('commit/warn/uncommittedChangesError')
    this.props
      .hasUncommitedChanges({
        repoId,
        action,
      })
      .then(() => {
        this.setState(rmWarning(warning))
      })
      .catch((error) => {
        console.error(warning, error)
        this.setState(addWarning(warning))
      })
  }

  beginChanges() {
    this.setState({
      hasUncommittedChanges: true,
      beginChanges: new Date(),
      readOnly: false,
    })

    this.notifyChanges('create')
  }

  concludeChanges(notify = true) {
    this.setState({
      hasUncommittedChanges: false,
    })

    if (notify) {
      this.notifyChanges('delete')
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const emptyRepo = {}
    const { repo = emptyRepo, loading } = this.props.data || {}
    const { repo: templateRepo = emptyRepo, loading: templateLoading } =
      this.props.templateData || {}
    const { repo: nextRepo = emptyRepo, loading: nextLoading } =
      nextProps.data || {}
    const { repo: nextTemplateRepo = emptyRepo, loading: nextTemplateLoading } =
      nextProps.templateData || {}

    const shouldLoad =
      repo !== nextRepo ||
      repo.commit !== nextRepo.commit ||
      loading !== nextLoading ||
      templateRepo !== nextTemplateRepo ||
      templateLoading !== nextTemplateLoading
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
        shouldUpdateActiveUsers,
      )
      if (shouldUpdateActiveUsers) {
        this.updateActiveUsers(nextProps)
      }
    }
  }

  updateActiveUsers(props) {
    const {
      uncommittedChanges: { users },
      me,
    } = props

    this.setState((state) => {
      const activeUsers = users.filter((user) => user.id !== me.id)
      const acknowledgedUsers = state.acknowledgedUsers

      let addToState = {}
      const newUsers = activeUsers.filter(
        (user) => !acknowledgedUsers.find((ack) => ack.id === user.id),
      )
      if (newUsers.length) {
        if (state.hasUncommittedChanges || state.didUnlock) {
          addToState = {
            interruptingUsers: newUsers,
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
          interruptingUsers: undefined,
        }
      }

      debug('updateActiveUsers', addToState, {
        activeUsers,
        acknowledgedUsers,
      })
      return {
        ...addToState,
        activeUsers,
        acknowledgedUsers,
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
    const {
      t,
      data: { loading, error, repo } = {},
      templateData: {
        loading: templateLoading,
        error: templateError,
        templateRepo,
      } = {},
      router,
    } = props

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
    if (templateLoading || templateError) {
      debug(
        'loadTemplateState',
        'isLoading',
        templateLoading,
        'hasError',
        templateError,
      )
      return
    }
    const repoId = router.query.repoId
    const commitId = router.query.commitId

    if (!commitId && repo && repo.latestCommit) {
      debug('loadState', 'redirect', repo.latestCommit)
      router.replace({
        pathname: `/repo/${repoId}/edit`,
        query: {
          commitId: repo.latestCommit.id,
        },
      })
      return
    }

    if (commitId && repo && !repo.commit) {
      this.setState(addWarning(t('commit/warn/commit404')))
      router.replace(`/repo/${repoId}/edit`)
      return
    }

    const { schema } = this.state
    if (!schema) {
      const commit =
        (repo && repo.commit) || (templateRepo && templateRepo.latestCommit)

      const schema =
        (commit && commit.document.meta.template) ||
        router.query.schema ||
        router.query.template

      debug('loadState', 'loadSchema', schema)
      this.setState(
        {
          schema: getSchema(schema),
        },
        () => {
          this.loadState(this.props)
        },
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
      if (templateRepo) {
        const commit = templateRepo.latestCommit
        let json = JSON.parse(
          JSON.stringify({
            ...commit.document.content,
            // add format & section to root mdast node
            format: commit.document.meta.format,
            section: commit.document.meta.section,
            series: commit.document.meta.series,
            repoId: commit.document.repoId,
          }),
        )

        const titleLeaf = findTitleLeaf(json)
        if (titleLeaf) {
          titleLeaf.value = router.query.title
        }
        let authorsP = findAuthorsP(json)
        if (authorsP) {
          const authorsMdast = parse(generateAuthorsLine(this.props.me))
            .children[0]
          authorsP.children = authorsMdast.children
          authorsP.type = authorsMdast.type
          delete authorsP.value
        }
        json.meta.title = router.query.title

        json.meta.auto = true
        json.meta.templateRepoId = router.query.templateRepoId

        committedEditorState = this.editor.serializer.deserialize(json)

        debug('loadState', 'new document from template', committedEditorState)
      } else {
        committedEditorState = this.editor.newDocument(
          router.query,
          this.props.me,
        )
        debug('loadState', 'new document', committedEditorState)
      }
    } else {
      const commit = repo.commit
      if (!commit) {
        this.setState({
          error: t('commit/warn/missing', { commitId }),
        })
        return
      }

      const json = {
        ...commit.document.content,
        // add format & section to root mdast node
        format: commit.document.meta.format,
        section: commit.document.meta.section,
        series: commit.document.meta.series,
        repoId: commit.document.repoId,
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
      committedEditorState.document.toJSON(),
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
          localEditorState = this.editor.serializer.deserialize({
            ...localState,
            // add format & section to root mdast node
            format: repo?.commit?.document?.meta?.format,
            section: repo?.commit?.document?.meta?.section,
            series: repo?.commit?.document?.meta?.series,
            repoId: repo?.commit?.document?.repoId,
          })
          debug('loadState', 'using local mdast document', localEditorState)
        }
      } catch (e) {
        console.error(e)
        this.setState(addWarning(t('commit/warn/localParseError')))
      }
    }

    const nextState = {
      committedRawDocString,
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
        this.editor.serializer.serialize(newEditorState),
      )
      debug(
        'loadState',
        'documentChangeHandler',
        'edited document',
        newEditorState,
      )
      if (process.env.NODE_ENV !== 'production') {
        debug(
          'loadState',
          'documentChangeHandler',
          'diff',
          require('diff').createPatch(
            'string',
            JSON.stringify(JSON.parse(committedRawDocString), null, 2),
            JSON.stringify(newEditorState.document.toJSON(), null, 2),
          ),
        )
      }

      const msSinceBegin =
        this.state.beginChanges &&
        new Date().getTime() - this.state.beginChanges.getTime()
      const { uncommittedChanges, me } = this.props
      if (
        !hasUncommittedChanges ||
        msSinceBegin > 1000 * 60 * 5 ||
        (!uncommittedChanges.users.find((user) => user.id === me.id) &&
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

  commitCleanup(data) {
    const {
      router: {
        query: { repoId },
      },
    } = this.props

    this.store.clear()
    this.concludeChanges()

    this.setState({
      committing: false,
    })
    this.props.router.replace({
      pathname: `/repo/${repoId}/edit`,
      query: {
        commitId: data.commit.id,
        isTemplate: null,
        templateRepoId: null,
        publishDate: null,
      },
    })
  }

  commitHandler() {
    const {
      router: {
        query: { repoId, commitId, isTemplate, publishDate },
      },
      commitMutation,
      editRepoMeta,
      data,
      t,
    } = this.props
    const { editorState } = this.state

    const message = window.prompt(t('commit/promtMessage'))
    if (!message) {
      return
    }
    this.setState({
      committing: true,
    })

    const isNew = commitId === 'new'

    commitMutation({
      repoId,
      parentId: isNew ? null : commitId,
      isTemplate: isNew ? isTemplate === 'true' : data?.repo?.isTemplate,
      message: message,
      document: {
        content: this.editor.serializer.serialize(editorState),
      },
    })
      .then(({ data }) => {
        if (publishDate) {
          editRepoMeta({
            repoId,
            publishDate,
          }).then(() => {
            this.commitCleanup(data)
          })
        } else {
          this.commitCleanup(data)
        }
      })
      .catch((e) => {
        console.error(e)
        this.setState((state) => ({
          committing: false,
          ...addWarning(
            t('commit/warn/failed', {
              error: errorToString(e),
            }),
          )(state),
        }))
      })
  }

  goToRaw(isTemplate) {
    const {
      router: {
        query: { repoId, commitId, schema, template },
      },
    } = this.props
    const { editorState } = this.state
    const serializedState = this.editor.serializer.serialize(editorState)
    this.beginChanges()
    this.store.set('editorState', serializedState)
    this.props.router.push({
      pathname: `/repo/${repoId}/raw`,
      query: {
        ...this.props.router.query,
        commitId,
        isTemplate: isTemplate,
        ...(commitId === 'new'
          ? {
              schema: schema || template,
            }
          : {}),
      },
    })
  }

  render() {
    const {
      router,
      data = {},
      templateData = {},
      uncommittedChanges,
      t,
    } = this.props
    const { repoId, commitId, publishDate } = router.query
    const { loading, repo } = data
    const { loading: templateLoading, error: templateError } = templateData
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
      didUnlock,
    } = this.state

    const isTemplate = repo
      ? repo.isTemplate
      : router.query.isTemplate === 'true'
    const meta = {
      ...repo?.meta,
      publishDate: publishDate || repo?.meta?.publishDate,
    }
    const isNew = commitId === 'new'
    const error = data.error || templateError || this.state.error
    const showLoading =
      committing || loading || templateLoading || (!schema && !error)
    const dark = editorState && editorState.document.data.get('darkMode')

    const sidebarPrependChildren = [
      ...warnings.filter(Boolean).map(({ time, message }, i) => (
        <Warning
          key={`warning-${i}`}
          message={`${time} ${message}`}
          onRemove={() => {
            this.setState(rmWarning(message))
          }}
        />
      )),
      !showLoading && repo && (
        <BranchingNotice
          key='branching-notice'
          repoId={repo.id}
          currentCommitId={commitId}
        />
      ),
      !showLoading && repo && repo.isArchived && (
        <RepoArchivedBanner key='repo-archived-banner' />
      ),
    ].filter(Boolean)
    const sidebarDisabled = !!(showLoading || error)
    return (
      <Frame raw>
        <Frame.Header
          isTemplate={isTemplate}
          barStyle={{
            borderBottom: activeUsers.length
              ? `3px solid ${readOnly ? colors.error : warningColor}`
              : undefined,
          }}
        >
          <Frame.Header.Section align='left'>
            <Frame.Nav>
              <RepoNav
                route={`/repo/${repoId}/edit`}
                isNew={isNew}
                prefix={isTemplate ? 'template' : 'document'}
              />
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
                color: showSidebar ? colors.primary : undefined,
              }}
              onMouseDown={this.toggleSidebarHandler}
            >
              <SettingsIcon size={SIDEBAR_ICON_SIZE} />
            </div>
          </Frame.Header.Section>
          <Frame.Header.Section align='right'>
            <CommitButton
              isNew={isNew}
              isTemplate={isTemplate}
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
                        interruptingUsers: undefined,
                      })
                    }
                  />
                )}
                <ColorContextProvider colorSchemeKey={dark ? 'dark' : 'light'}>
                  {this.state.previewScreenSize !== null ? (
                    <ColorContextProvider
                      colorSchemeKey={
                        this.state.previewDarkmode ? 'dark' : 'light'
                      }
                    >
                      <PreviewFrame
                        previewScreenSize={this.state.previewScreenSize}
                        repoId={repoId}
                        commitId={commitId}
                        darkmode={this.state.previewDarkmode}
                      />
                    </ColorContextProvider>
                  ) : null}
                  <Editor
                    ref={this.editorRef}
                    schema={schema}
                    isTemplate={isTemplate}
                    meta={meta}
                    value={editorState}
                    onChange={this.changeHandler}
                    onDocumentChange={this.documentChangeHandler}
                    readOnly={readOnly}
                    hide={this.state.previewScreenSize !== null}
                  />
                </ColorContextProvider>
              </div>
            )}
          />
          <Sidebar
            prependChildren={sidebarPrependChildren}
            isDisabled={sidebarDisabled}
            selectedTabId={readOnly ? 'workflow' : 'edit'}
            isOpen={showSidebar}
            onTabChange={(activeTab) => {
              if (activeTab !== 'view') {
                // reset device preivew when navigation away from view
                this.setState({ previewScreenSize: null })
              }
            }}
          >
            {!readOnly && (
              <Sidebar.Tab tabId='edit' label='Editieren'>
                <button
                  onClick={() => this.goToRaw(isTemplate)}
                  {...plainButtonRule}
                  style={{ color: colors.primary }}
                >
                  {t('pages/raw/title')}
                </button>
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
            <Sidebar.Tab tabId='view' label='Ansicht'>
              <Interaction.P style={{ marginBottom: 16 }}>
                Vorschau
              </Interaction.P>
              <ScreenSizePicker
                selectedScreenSize={this.state.previewScreenSize}
                onSelect={(screenSize) => {
                  this.setState({ previewScreenSize: screenSize })
                }}
              />
              {this.state.previewScreenSize ? (
                <>
                  <Interaction.P style={{ marginBottom: 16 }}>
                    Nachtmodus
                  </Interaction.P>
                  <Checkbox
                    black
                    checked={this.state.previewDarkmode}
                    onChange={() =>
                      this.setState({
                        previewDarkmode: !this.state.previewDarkmode,
                      })
                    }
                  >
                    Ein
                  </Checkbox>
                </>
              ) : null}
            </Sidebar.Tab>
          </Sidebar>
        </Frame.Body>
      </Frame>
    )
  }
}

export default withDefaultSSR(
  compose(
    withRouter,
    withT,
    withAuthorization(['editor']),
    withMe,
    graphql(getCommitById, {
      skip: ({ router }) =>
        router.query.commitId === 'new' || !router.query.commitId,
      options: ({ router }) => ({
        variables: {
          repoId: getRepoIdFromQuery(router.query),
          commitId: router.query.commitId,
        },
      }),
    }),
    graphql(getLatestCommit, {
      skip: ({ router }) =>
        !!router.query.commitId && router.query.commitId !== 'new',
      options: ({ router }) => ({
        // always the latest
        fetchPolicy: 'network-only',
        variables: {
          repoId: getRepoIdFromQuery(router.query),
        },
      }),
      props: ({ data, ownProps: { router, t } }) => {
        if (router.query.commitId === 'new') {
          if (data.repo && data.repo.latestCommit) {
            return {
              data: {
                error: t('repo/add/alreadyExists'),
              },
            }
          }
          return {}
        }
        return {
          data,
        }
      },
    }),
    graphql(getTemplateById, {
      name: 'templateData',
      skip: ({ router }) => !router.query.templateRepoId,
      options: ({ router }) => ({
        variables: {
          repoId: router.query.templateRepoId,
        },
      }),
    }),
    withUncommitedChanges({
      options: ({ router }) => ({
        variables: {
          repoId: getRepoIdFromQuery(router.query),
        },
      }),
    }),
    graphql(commitMutation, {
      props: ({ mutate }) => ({
        commitMutation: (variables) =>
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
                    commitId: parentId,
                  },
                })
                data = {
                  ...oldData,
                  repo: {
                    ...oldData.repo,
                    commit,
                  },
                }
              } else {
                data = {
                  repo: {
                    ...commit.repo,
                    commit,
                  },
                }
              }
              store.writeQuery({
                query: getCommitById,
                variables: {
                  repoId,
                  commitId: commit.id,
                },
                data,
              })
            },
          }),
      }),
    }),
    withUncommittedChangesMutation,
    withEditRepoMeta,
  )(EditorPage),
)
