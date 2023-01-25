import { ActiveInterruptionOverlay } from '../VersionControl/UncommittedChanges'
import { Warnings } from './Warnings'
import RepoArchivedBanner from '../Repo/ArchivedBanner'
import { css } from 'glamor'
import ContentEditor from '../ContentEditor'
import { PhaseSummary } from './Workflow'
import { HEADER_HEIGHT } from '../Frame/constants'
import MetaDataForm from '../MetaDataForm'
import { useEffect, useState } from 'react'
import { getSyncText, SYNC_LIST, SYNC_RULES } from './Sync'
import { useDebounce } from '@project-r/styleguide'

const styles = {
  phase: css({
    position: 'fixed',
    right: 20,
    top: HEADER_HEIGHT,
    zIndex: 21,
    marginTop: 13,
  }),
}

const EditView = ({
  interruptingUsers,
  uncommittedChanges,
  revertHandler,
  interruptionHandler,
  repo,
  hasUncommittedChanges,
  content,
  setContent,
  readOnly,
  publishDate,
}) => {
  const [debouncedContent] = useDebounce(content, 500)
  const [syncKeys, setSyncKeys] = useState([])
  const [keysSynced, setKeysSynced] = useState(false)

  const sync = (key) => {
    setSyncKeys(
      [key, ...syncKeys].filter(
        // de-dup
        (key, i, all) => all.findIndex((w) => w === key) === i,
      ),
    )
  }

  const unsync = (key) => setSyncKeys(syncKeys.filter((item) => item !== key))

  const setMetaData = (newMeta) => {
    setContent((currentContent) => ({
      ...currentContent,
      meta:
        typeof newMeta === 'function' ? newMeta(currentContent.meta) : newMeta,
    }))
  }

  const setMetaDataField = (name, value) => {
    setMetaData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      }
    })
  }

  useEffect(() => {
    if (!debouncedContent?.children) return
    // initialisation
    if (!keysSynced) {
      setSyncKeys(
        SYNC_LIST.filter((key) => {
          if (!debouncedContent.meta[key]) return true
          const rule = SYNC_RULES[key]
          const text = getSyncText(debouncedContent, rule.syncWithPath)
          return text === debouncedContent.meta[key]
        }),
      )
      setKeysSynced(true)
      return
    }
    // syncing
    syncKeys.forEach((key) => {
      const rule = SYNC_RULES[key]
      const text = getSyncText(debouncedContent, rule.syncWithPath)
      if (text !== debouncedContent.meta[key]) {
        setMetaDataField(key, text)
      }
    })
  }, [debouncedContent, syncKeys, keysSynced])

  const repoId = repo?.id
  const commitId = (repo?.commit || repo?.latestCommit)?.id

  return (
    <>
      {interruptingUsers && (
        <ActiveInterruptionOverlay
          uncommittedChanges={uncommittedChanges}
          interruptingUsers={interruptingUsers}
          onRevert={revertHandler}
          onAcknowledged={interruptionHandler}
        />
      )}
      <Warnings />
      {repo?.isArchived && (
        <RepoArchivedBanner
          style={{ zIndex: 23, position: 'sticky', top: HEADER_HEIGHT }}
        />
      )}
      {!readOnly && (
        <div {...styles.phase}>
          <PhaseSummary
            commitId={commitId}
            repoId={repoId}
            hasUncommittedChanges={hasUncommittedChanges}
          />
        </div>
      )}
      {!!content?.children && (
        <ContentEditor
          commitId={commitId}
          repoId={repoId}
          publishDate={publishDate}
          value={content.children}
          onChange={(newValue) =>
            setContent((currentContent) => ({
              ...currentContent,
              children: newValue,
            }))
          }
          readOnly={readOnly || repo?.isArchived}
        />
      )}
      {!!content && (
        <MetaDataForm
          metaData={content.meta || {}}
          onFieldChange={setMetaDataField}
          publishDate={publishDate}
          syncKeys={syncKeys}
          sync={sync}
          unsync={unsync}
        />
      )}
    </>
  )
}

export default EditView
