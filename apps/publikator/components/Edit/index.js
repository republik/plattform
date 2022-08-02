import { compose } from 'react-apollo'
import { withRouter } from 'next/router'
import {
  withCommitData,
  withCommitMutation,
  withLatestCommit,
} from './enhancers'
import { Loader, A, useDebounce } from '@project-r/styleguide'
import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import createDebug from 'debug'
import { timeFormat } from 'd3-time-format'
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
import { useEffect, useState } from 'react'
import Warning from '../Sidebar/Warning'
import RepoArchivedBanner from '../Repo/ArchivedBanner'
import { css } from 'glamor'
import ContentEditor from '../ContentEditor'
import { API_UNCOMMITTED_CHANGES_URL } from '../../lib/settings'

const styles = {
  defaultContainer: css({
    padding: 20,
  }),
  navLink: css({
    paddingRight: 10,
  }),
}

const debug = createDebug('publikator:pages:flyer:edit')
const TEST = process.env.NODE_ENV === 'test'

export const CONTENT_KEY = 'content'
export const META_KEY = 'meta'

const formatTime = timeFormat('%H:%M')

const addWarning = (warnings, message) => {
  const time = formatTime(new Date())
  return [{ time, message }, ...warnings].filter(
    // de-dup
    ({ message }, i, all) => all.findIndex((w) => w.message === message) === i,
  )
}

const rmWarning = (warnings, message) =>
  warnings.filter((warning) => warning.message !== message)

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
  const [store, setStore] = useState(undefined)
  const [readOnly, setReadOnly] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [warnings, setWarnings] = useState([])
  const [activeUsers, setActiveUsers] = useState(undefined)
  const [acknowledgedUsers, setAcknowledgedUsers] = useState(undefined)
  const [interruptingUsers, setInterruptingUsers] = useState(undefined)
  const [beginChanges, setBeginChanges] = useState(undefined)
  const [hasUncommittedChanges, setHasUncommittedChanges] = useState(false)
  const [didUnlock, setDidUnlock] = useState(false)
  const [localError, setLocalError] = useState(undefined)

  // cleanup effect
  useEffect(() => {
    return () => {
      if (!hasUncommittedChanges && didUnlock) {
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
  }, [])

  useEffect(() => {
    updateActiveUsers()
  }, [uncommittedChanges])

  useEffect(() => {
    if (store.get(CONTENT_KEY) || store.get(META_KEY)) {
      const msSinceBegin =
        beginChanges && new Date().getTime() - beginChanges.getTime()
      if (
        !hasUncommittedChanges ||
        msSinceBegin > 1000 * 60 * 5 ||
        (!uncommittedChanges.users.find((user) => user.id === me.id) &&
          (!msSinceBegin || msSinceBegin > 1000))
      ) {
        beginChangesHandler()
      }
    } else {
      if (hasUncommittedChanges) {
        store.clear()
        concludeChanges(!this.state.didUnlock)
      }
    }
  }, [store])

  const isNew = commitId === 'new'

  if (!process.browser && !TEST) {
    console.warn(`loadState should only run in the browser`)
    return null
  }

  // users management and warnings
  const lock = () => {
    const noLock = t('commit/warn/canNotLock')
    if (hasUncommittedChanges) {
      return setWarnings(addWarning(warnings, noLock))
    }
    setReadOnly(true)
    setWarnings(rmWarning(warnings, noLock))
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
        setWarnings(rmWarning(warnings, warning))
      })
      .catch((error) => {
        console.error(warning, error)
        setWarnings(addWarning(warnings, warning))
      })
  }

  const lockHandler = (event) => {
    event && event.preventDefault()
    setDidUnlock(false)
    if (hasUncommittedChanges) {
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
    setHasUncommittedChanges(true)
    setBeginChanges(new Date())
    setReadOnly(false)
    notifyBackend('create')
  }

  const concludeChanges = (notify = true) => {
    setHasUncommittedChanges(false)
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
      if (hasUncommittedChanges || didUnlock) {
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

  // init local storage
  const checkLocalStorageSupport = () => {
    if (store && !store.supported) {
      setWarnings(addWarning(warnings, t('commit/warn/noStorage')))
    }
  }

  const storeKey = [repoId, commitId].join('/')
  if (!store || store.key !== storeKey) {
    setStore(initLocalStore(storeKey))
    checkLocalStorageSupport()
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
        content: store.get(CONTENT_KEY),
        // TODO: meta
        // meta: store.get(META_KEY),
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
        setWarnings(
          addWarning(
            warnings,
            t('commit/warn/failed', {
              error: errorToString(e),
            }),
          ),
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
    store.clear()
  }

  const repo = data?.repo
  const hasError = localError || data?.error
  const pending = (!isNew && !data) || committing || data?.loading

  const stuffToAddSomewhere = [
    ...warnings
      .filter(Boolean)
      .map(({ time, message }, i) => (
        <Warning
          key={`warning-${i}`}
          message={`${time} ${message}`}
          onRemove={() => setWarnings(rmWarning(warnings, message))}
        />
      )),
    !pending && repo && (
      <BranchingNotice
        key='branching-notice'
        repoId={repo.id}
        currentCommitId={commitId}
      />
    ),
    !pending && repo?.isArchived && (
      <RepoArchivedBanner key='repo-archived-banner' />
    ),
  ].filter(Boolean)

  return (
    <Frame raw>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Frame.Nav>
            <span {...styles.navLink}>Document</span>
            <span {...styles.navLink}>
              <Link route='flyer/preview' passHref>
                <A>Vorschau</A>
              </Link>
            </span>
            <span {...styles.navLink}>
              <Link route='repo/tree' passHref>
                <A>Versionen</A>
              </Link>
            </span>
          </Frame.Nav>
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          <CommitButton
            isNew={isNew}
            readOnly={!pending && readOnly}
            didUnlock={didUnlock}
            hasUncommittedChanges={!pending && hasUncommittedChanges}
            onUnlock={unlockHandler}
            onLock={lockHandler}
            onCommit={commitHandler}
            onRevert={revertHandler}
          />
        </Frame.Header.Section>
        <Frame.Header.Section align='right'>
          {!pending && !!repo && (
            <BranchingNotice
              asIcon
              repoId={repo.id}
              currentCommitId={commitId}
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
            // checks to make ensure repo/commit integrity
            if (!commitId && repo && repo.latestCommit) {
              debug('loadState', 'redirect', repo.latestCommit)
              // TODO: get base path from router
              Router.replaceRoute('repo/flyer/edit', {
                repoId: repoId.split('/'),
                commitId: repo.latestCommit.id,
              })
              return null
            }

            if (commitId && repo && !repo.commit) {
              setWarnings(addWarning(warnings, t('commit/warn/commit404')))
              Router.replaceRoute('repo/flyer/edit', {
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

            console.log(repo?.commit.document)

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
                {stuffToAddSomewhere}
                <ContentEditor
                  store={store}
                  reference={repo?.commit.document.content}
                />
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
