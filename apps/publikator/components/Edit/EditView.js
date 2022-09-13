import { ActiveInterruptionOverlay } from '../VersionControl/UncommittedChanges'
import { Warnings } from './Warnings'
import RepoArchivedBanner from '../Repo/ArchivedBanner'
import { css } from 'glamor'
import ContentEditor from '../ContentEditor'
import { PhaseSummary } from './Workflow'
import { HEADER_HEIGHT } from '../Frame/constants'
import MetaDataForm from '../MetaDataForm'

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
  editorKey,
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
      <div {...styles.phase}>
        <PhaseSummary
          commitId={(repo?.commit || repo?.latestCommit)?.id}
          repoId={repo?.id}
          hasUncommittedChanges={hasUncommittedChanges}
        />
      </div>
      {!!content?.children && (
        <ContentEditor
          key={editorKey}
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
          setMetaData={(newMeta) => {
            setContent((currentContent) => ({
              ...currentContent,
              meta:
                typeof newMeta === 'function'
                  ? newMeta(currentContent.meta)
                  : newMeta,
            }))
          }}
          publishDate={publishDate}
        />
      )}
    </>
  )
}

export default EditView
