import { useRouter, withRouter } from 'next/router'
import {
  withCommitData,
  withCommitMutation,
  withLatestCommit,
} from './enhancers'
import {
  Loader,
  useDebounce,
  usePrevious,
  flyerTemplate,
} from '@project-r/styleguide'
import { cleanupTree } from '@project-r/styleguide/editor'
import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import isEqual from 'lodash/isEqual'
import createDebug from 'debug'
import initLocalStore from '../../lib/utils/localStorage'
import { errorToString } from '../../lib/utils/errors'
import Frame from '../Frame'
import CommitButton from '../VersionControl/CommitButton'
import {
  joinUsers,
  UncommittedChanges,
  withUncommitedChanges,
  withUncommittedChangesMutation,
} from '../VersionControl/UncommittedChanges'
import BranchingNotice from '../VersionControl/BranchingNotice'
import { useEffect, useState } from 'react'
import { useWarningContext } from './Warnings'
import { API_UNCOMMITTED_CHANGES_URL } from '../../lib/settings'
import EditView from './EditView'
import compose from 'lodash/flowRight'
import { getQueryFromRepoId, getRepoIdFromQuery } from '../../lib/repoIdHelper'
import Nav from './Nav'
import { withEditRepoMeta } from '../Repo/EditMetaDate'
import Preview from '../Preview'

const debug = createDebug('publikator:slate:edit')

const getCommittedContent = (data) => data?.repo?.commit?.document?.content

export const getCurrentContent = (store, data, options = {}) => {
  const storedContent = store?.get('editorState')
  const committedContent = getCommittedContent(data)
  return (
    storedContent ||
    committedContent || {
      children: flyerTemplate,
      meta: {
        title: options.title || 'Journal',
        slug: 'journal',
        template: 'flyer',
        feed: false,
        format: 'https://github.com/republik/format-journal',
      },
    }
  )
}

const EditLoader = ({
  router: { query, pathname },
  t,
  data,
  hasUncommitedChanges,
  uncommittedChanges,
  commitMutation,
  editRepoMeta,
  me,
}) => {
  const [editorKey, setEditorKey] = useState(1)
  const remountEditor = () => setEditorKey((key) => key + 1)

  const router = useRouter()
  const { commitId, publishDate } = query
  const repoId = getRepoIdFromQuery(query)
  const { preview, ...queryWithoutPreview } = query
  const { addWarning, rmWarning } = useWarningContext()
  const [store, setStore] = useState(undefined)
  const [readOnly, setReadOnly] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [activeUsers, setActiveUsers] = useState(undefined)
  const [acknowledgedUsers, setAcknowledgedUsers] = useState(undefined)
  const [interruptingUsers, setInterruptingUsers] = useState(undefined)
  const [beginChanges, setBeginChanges] = useState(undefined)
  const [didUnlock, setDidUnlock] = useState(false)
  const prevUncommittedChanges = usePrevious(uncommittedChanges)

  // document.content to be committed ({children, meta})
  const [content, setContent] = useState()
  const [debouncedContent] = useDebounce(content, 500)

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
    if (commitId && repoId && !data?.loading) {
      const storeKey = [repoId, commitId].join('/')
      const dataKey = [data?.repo?.id, data?.repo?.commit?.id].join('/')
      if (
        store?.key !== storeKey &&
        (commitId === 'new' || dataKey === storeKey)
      ) {
        const newStore = initLocalStore(storeKey)
        setStore(newStore)
        checkLocalStorageSupport()
        forceSetContent(getCurrentContent(newStore, data, query))
      }
    }
  }, [store, commitId, repoId, data])

  useEffect(() => {
    if (debouncedContent) {
      contentChangeHandler()
    }
  }, [debouncedContent])

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
    notifyBackend('create')
    unlock()
  }

  const beginChangesHandler = () => {
    setBeginChanges(new Date())
    notifyBackend('create')
    unlock()
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
  const forceSetContent = (newContent) => {
    setContent(newContent)
    remountEditor()
  }

  const checkLocalStorageSupport = () => {
    if (store && !store.supported) {
      addWarning(t('commit/warn/noStorage'))
    }
  }

  const commitCleanup = (data) => {
    store.clear()
    concludeChanges()
    setCommitting(false)
    router.replace({
      pathname,
      query: {
        ...getQueryFromRepoId(repoId),
        commitId: data.commit.id,
      },
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
          ...content,
          children: cleanupTree(content.children, true),
        },
      },
    })
      .then(({ data }) => {
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
    forceSetContent(getCurrentContent(null, data, query))
    router.replace({
      pathname,
      query: queryWithoutPreview,
    })
  }

  const contentChangeHandler = () => {
    if (!debouncedContent) {
      return
    }
    const committedContent = getCommittedContent(data)
    if (
      !committedContent ||
      !isEqual(
        cleanupTree(committedContent.children, true),
        cleanupTree(debouncedContent.children, true),
      ) ||
      !isEqual(committedContent.meta, debouncedContent.meta)
    ) {
      store.set('editorState', debouncedContent)
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
  const pending = (!isNew && !data) || committing || data?.loading
  const commit = repo && (repo.commit || repo.latestCommit)

  return (
    <Frame raw>
      <Frame.Header>
        <Frame.Header.Section align='left'>
          <Nav isNew={isNew} />
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
          {!pending && !!repo && (
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
          error={data?.error}
          render={() => {
            // checks to make ensure repo/commit integrity
            if (!commitId && repo && repo.latestCommit) {
              debug('loadState', 'redirect', repo.latestCommit)
              router.replace({
                pathname,
                query: {
                  ...query,
                  ...getQueryFromRepoId(repoId),
                  commitId: repo.latestCommit.id,
                },
              })
              return null
            }

            if (commitId && repo && !repo.commit) {
              addWarning(t('commit/warn/commit404'))
              router.replace({
                pathname,
                query: getQueryFromRepoId(repoId),
              })
              return null
            }

            if (!isNew) {
              const commit = repo?.commit
              if (!commit) {
                addWarning(t('commit/warn/missing', { commitId }))
                return null
              }
            }

            return preview ? (
              <Preview repoId={repoId} commitId={commitId} isFlyer />
            ) : (
              <EditView
                key={editorKey}
                interruptingUsers={interruptingUsers}
                uncommittedChanges={uncommittedChanges}
                revertHandler={revertHandler}
                interruptionHandler={() => {
                  setAcknowledgedUsers(activeUsers)
                  setInterruptingUsers(undefined)
                }}
                repo={repo}
                hasUncommittedChanges={beginChanges}
                content={content}
                setContent={setContent}
                publishDate={repo?.meta?.publishDate || publishDate}
                readOnly={readOnly}
              />
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
        repoId: getRepoIdFromQuery(router.query),
      },
    }),
  }),
  withUncommittedChangesMutation,
  withCommitMutation,
  withEditRepoMeta,
)(EditLoader)
