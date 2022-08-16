import { compose } from 'react-apollo'
import { withRouter } from 'next/router'
import {
  withCommitData,
  withCommitMutation,
  withLatestCommit,
} from './enhancers'
import { Loader, A, useDebounce, slug } from '@project-r/styleguide'
import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import isEqual from 'lodash/isEqual'
import createDebug from 'debug'
import initLocalStore from '../../lib/utils/localStorage'
import { Link, Router } from '../../lib/routes'
import { errorToString } from '../../lib/utils/errors'
import Frame from '../Frame'
import CommitButton from '../VersionControl/CommitButton'
import {
  ActiveInterruptionOverlay,
  joinUsers,
  UncommittedChanges,
  withUncommitedChanges,
  withUncommittedChangesMutation,
} from '../VersionControl/UncommittedChanges'
import BranchingNotice from '../VersionControl/BranchingNotice'
import { useEffect, useState, useRef } from 'react'
import { Warnings, useWarningContext } from './Warnings'
import RepoArchivedBanner from '../Repo/ArchivedBanner'
import { css } from 'glamor'
import ContentEditor, { INITIAL_VALUE } from '../ContentEditor'
import { API_UNCOMMITTED_CHANGES_URL } from '../../lib/settings'
import { PhaseSummary } from './Workflow'
import { HEADER_HEIGHT } from '../Frame/constants'

const styles = {
  defaultContainer: css({
    padding: 20,
  }),
  navLink: css({
    paddingRight: 10,
  }),
  phase: css({
    position: 'fixed',
    right: 20,
    top: HEADER_HEIGHT,
    zIndex: 21,
    marginTop: 13,
  }),
}

const debug = createDebug('publikator:pages:flyer:edit')

export const CONTENT_KEY = 'value'
export const META_KEY = 'meta'

export const getCompString = (array) =>
  array && JSON.stringify({ children: array })

const getCommittedValue = (data) =>
  data?.repo?.commit?.document?.content?.children

const usePreviousValue = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const EditLoader = ({
  router: {
    query: { repoId, commitId, publishDate },
  },
  t,
  data,
  hasUncommitedChanges,
  uncommittedChanges,
  commitMutation,
  editRepoMeta,
  me,
}) => {
  const { addWarning, rmWarning } = useWarningContext()
  const [store, setStore] = useState(undefined)
  const [readOnly, setReadOnly] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [activeUsers, setActiveUsers] = useState(undefined)
  const [acknowledgedUsers, setAcknowledgedUsers] = useState(undefined)
  const [interruptingUsers, setInterruptingUsers] = useState(undefined)
  const [beginChanges, setBeginChanges] = useState(undefined)
  const [didUnlock, setDidUnlock] = useState(false)
  const [localError, setLocalError] = useState(undefined)
  const prevUncommittedChanges = usePreviousValue(uncommittedChanges)
  // value = slate tree for the wysiwyg
  const [value, setValue] = useState()
  const [debouncedValue] = useDebounce(value, 500)

  // cleanup effect
  useEffect(() => {
    window.addEventListener('beforeunload', cleanupNotifications)
    return () => {
      cleanupNotifications()
      window.removeEventListener('beforeunload', cleanupNotifications)
    }
  }, [])

  useEffect(() => {
    if (prevUncommittedChanges?.users !== uncommittedChanges?.users) {
      updateActiveUsers()
    }
  }, [uncommittedChanges])

  // new route, new store
  useEffect(() => {
    initStore()
  }, [commitId, repoId])

  // when data is loaded and store is set up: we (re)initialise the value
  useEffect(() => {
    if (store && !data?.loading) {
      resetValue()
    }
  }, [data, store])

  useEffect(() => {
    if (debouncedValue) {
      contentChangeHandler()
    }
  }, [debouncedValue])

  const isNew = commitId === 'new'

  // users management and warnings
  const lock = () => {
    const noLock = t('commit/warn/canNotLock')
    if (beginChanges) {
      return addWarning(noLock)
    }
    setReadOnly(true)
    rmWarning(noLock)
  }

  const unlock = () => setReadOnly(false)

  const notifyBackend = (action) => {
    // we don't notify the backend if no backend repo exists
    if (commitId === 'new') return
    debug('notifyChanges', action)
    const warning = t('commit/warn/uncommittedChangesError')
    hasUncommitedChanges({
      repoId,
      action,
    })
      .then(() => {
        rmWarning(warning)
      })
      .catch((error) => {
        console.error(warning, error)
        addWarning(warning)
      })
  }

  const cleanupNotifications = (event) => {
    if (!beginChanges && didUnlock) {
      notifyBackend('delete')
      if (event) {
        try {
          navigator.sendBeacon(
            API_UNCOMMITTED_CHANGES_URL,
            JSON.stringify({
              repoId,
              action: 'delete',
            }),
          )
        } catch (e) {}
      }
    }
  }

  const lockHandler = (event) => {
    event && event.preventDefault()
    setDidUnlock(false)
    if (beginChanges) {
      console.warn(
        'lockHandler should not be called when user has uncommitted changes',
      )
      return
    }
    notifyBackend('delete')
    lock()
  }

  const unlockHandler = (event) => {
    event && event.preventDefault()
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
    setDidUnlock(true)
    setAcknowledgedUsers(activeUsers)
    setReadOnly(false)
    notifyBackend('create')
    unlock()
  }

  const beginChangesHandler = () => {
    setBeginChanges(new Date())
    setReadOnly(false)
    notifyBackend('create')
  }

  const concludeChanges = (notify = true) => {
    setBeginChanges(undefined)
    if (notify) {
      notifyBackend('delete')
    }
  }

  const updateActiveUsers = () => {
    const users = uncommittedChanges?.users
    setActiveUsers(users?.filter((user) => user.id !== me.id))
    const newUsers = activeUsers?.filter(
      (user) => !acknowledgedUsers?.find((ack) => ack.id === user.id),
    )
    setInterruptingUsers(undefined)
    if (newUsers?.length) {
      if (beginChanges || didUnlock) {
        setInterruptingUsers(newUsers)
      } else {
        lock()
      }
    } else {
      if (readOnly && !activeUsers.length) {
        unlock()
      }
    }
    debug('updateActiveUsers', {
      interruptingUsers,
      activeUsers,
    })
  }

  // once Slate has initialised the editor, the value cannot be reset
  // from outside the editor. discussion:
  // https://github.com/ianstormtaylor/slate/pull/4540
  // this is a workaround to rerender the editor when we want
  // to reset the value
  const updateContentEditor = (newValue) => {
    setValue(undefined)
    setTimeout(() => setValue(newValue))
  }

  const resetValue = () => {
    const storedValue = store.get(CONTENT_KEY)
    const committedValue = getCommittedValue(data)
    updateContentEditor(storedValue || committedValue || INITIAL_VALUE)
  }

  const checkLocalStorageSupport = () => {
    if (store && !store.supported) {
      addWarning(t('commit/warn/noStorage'))
    }
  }

  const initStore = () => {
    const storeKey = [repoId, commitId].join('/')
    if (!store || store.key !== storeKey) {
      setStore(initLocalStore(storeKey))
      checkLocalStorageSupport()
    }
  }

  const commitCleanup = (data) => {
    store.clear()
    concludeChanges()
    setCommitting(false)
    Router.replaceRoute('flyer/edit', {
      repoId: repoId.split('/'),
      commitId: data.commit.id,
      publishDate: null,
    })
  }

  const commitHandler = () => {
    const message = window.prompt(t('commit/promtMessage'))
    if (!message) {
      return
    }
    setCommitting(true)
    commitMutation({
      repoId,
      parentId: isNew ? null : commitId,
      message: message,
      document: {
        type: 'slate',
        content: {
          children: store.get(CONTENT_KEY),
          // TODO: meta
          // meta: store.get(META_KEY),
          // until then, a helping hand
          meta: {
            slug: slug(repoId),
            template: 'flyer',
          },
        },
      },
    })
      .then(({ data }) => {
        // TODO: obliterate this
        if (publishDate) {
          editRepoMeta({
            repoId,
            publishDate,
          }).then(() => {
            commitCleanup(data)
          })
        } else {
          commitCleanup(data)
        }
      })
      .catch((e) => {
        console.error(e)
        setCommitting(false)
        addWarning(
          t('commit/warn/failed', {
            error: errorToString(e),
          }),
        )
      })
  }

  const revertHandler = (e) => {
    e.preventDefault()
    if (!window.confirm(t('revert/confirm'))) {
      return
    }
    setDidUnlock(false)
    setAcknowledgedUsers([])
    updateContentEditor(getCommittedValue(data) || INITIAL_VALUE)
  }

  const contentChangeHandler = () => {
    const committedValue = getCommittedValue(data)
    if (!committedValue || !isEqual(committedValue, debouncedValue)) {
      store.set(CONTENT_KEY, debouncedValue)
      const msSinceBegin =
        beginChanges && new Date().getTime() - beginChanges.getTime()
      if (
        !msSinceBegin ||
        msSinceBegin > 1000 * 60 * 5 ||
        (!uncommittedChanges.users.find((user) => user.id === me.id) &&
          (!msSinceBegin || msSinceBegin > 1000))
      ) {
        beginChangesHandler()
      }
    } else {
      store.clear()
      if (beginChanges) {
        concludeChanges(!didUnlock)
      }
    }
  }

  const repo = data?.repo
  const hasError = localError || data?.error
  const pending = (!isNew && !data) || committing || data?.loading
  const commit = repo && (repo.commit || repo.latestCommit)
  const noEdits = !pending && (readOnly || repo?.isArchived)

  return (
    <Frame raw>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav>
            <span {...styles.navLink}>Dokument</span>
            <span {...styles.navLink}>
              <Link route='flyer/preview' passHref>
                <A>Vorschau</A>
              </Link>
            </span>
            <span {...styles.navLink}>
              <Link
                route='repo/tree'
                params={{
                  repoId: repoId.split('/'),
                }}
                passHref
              >
                <A>Versionen</A>
              </Link>
            </span>
          </Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <div style={{ marginRight: 20 }}>
            <CommitButton
              isNew={isNew}
              readOnly={!pending && readOnly}
              didUnlock={didUnlock}
              hasUncommittedChanges={!pending && beginChanges}
              onUnlock={unlockHandler}
              onLock={lockHandler}
              onCommit={commitHandler}
              onRevert={revertHandler}
            />
          </div>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          {!pending && !!repo && (
            <BranchingNotice
              asIcon
              repoId={repo.id}
              commit={commit}
              hasUncommittedChanges={beginChanges}
            />
          )}
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          {!!repo && (
            <UncommittedChanges uncommittedChanges={uncommittedChanges} t={t} />
          )}
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <Frame.Me />
        </Frame.Header.Section>
      </Frame.Header>
      <Frame.Body raw>
        <Loader
          loading={pending}
          error={hasError}
          render={() => {
            // TODO: redirect doesn't work here – move it
            // checks to make ensure repo/commit integrity
            if (!commitId && repo && repo.latestCommit) {
              debug('loadState', 'redirect', repo.latestCommit)
              // TODO: get base path from router
              Router.replaceRoute('flyer/edit', {
                repoId: repoId.split('/'),
                commitId: repo.latestCommit.id,
              })
              return null
            }

            if (commitId && repo && !repo.commit) {
              addWarning(t('commit/warn/commit404'))
              Router.replaceRoute('flyer/edit', {
                repoId: repoId.split('/'),
              })
              return null
            }

            if (!isNew) {
              const commit = repo?.commit
              if (!commit) {
                setLocalError(t('commit/warn/missing', { commitId }))
                return null
              }
            }

            return (
              <>
                {interruptingUsers && (
                  <ActiveInterruptionOverlay
                    uncommittedChanges={uncommittedChanges}
                    interruptingUsers={interruptingUsers}
                    onRevert={revertHandler}
                    onAcknowledged={() => {
                      setAcknowledgedUsers(activeUsers)
                      setInterruptingUsers(undefined)
                    }}
                  />
                )}
                <Warnings />
                {!pending && repo?.isArchived && (
                  <RepoArchivedBanner
                    style={{ zIndex: 23, position: 'fixed' }}
                  />
                )}
                <div {...styles.phase}>
                  <PhaseSummary
                    commitId={commit?.id}
                    repoId={repoId}
                    phase={repo?.currentPhase}
                    hasUncommittedChanges={beginChanges}
                    isNew={isNew}
                  />
                </div>
                {!!value && (
                  <ContentEditor
                    value={value}
                    onChange={setValue}
                    readOnly={noEdits}
                  />
                )}
              </>
            )
          }}
        />
      </Frame.Body>
    </Frame>
  )
}

export default compose(
  withRouter,
  withT,
  withMe,
  withCommitData,
  withLatestCommit,
  withUncommitedChanges({
    options: ({ router }) => ({
      variables: {
        repoId: router.query.repoId,
      },
    }),
  }),
  withUncommittedChangesMutation,
  withCommitMutation,
)(EditLoader)
