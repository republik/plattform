import { forwardRef, useContext } from 'react'

import { useTranslation } from '../../lib/withT'
import datetime from '../Article/Progress/datetime'

import { useProgress } from '../Article/Progress/api'
import { ProgressCircle, IconButton, CalloutMenu } from '@project-r/styleguide'
import { ProgressContext } from '../Article/Progress'
import { IconCheckSmall, IconHighlightOff, IconRead } from '@republik/icons'

const UserProgress = ({
  documentPath,
  forceShortLabel,
  noCallout,
  noScroll,
  displayMinutes,
}) => {
  const { restoreArticleProgress } = useContext(ProgressContext)
  const {
    upsertDocumentProgress,
    removeDocumentProgress, 
    getDocumentProgress,
  } = useProgress()
  const { t } = useTranslation()

  const { data } = getDocumentProgress({
    variables: { path: documentPath },
  })
  const userProgress = data?.document?.userProgress
  const documentId = data?.document?.id
  // Once consent has been given or not return null if there is no user progress object
  // or displayminutes are below 1min
  if (!userProgress || displayMinutes < 1) {
    return null
  }

  const {
    max: { percentage },
    updatedAt,
  } = userProgress
  const percent = Math.round(percentage * 100)

  const ReadIcon = forwardRef((props, ref) => (
    <IconButton
      Icon={IconRead}
      label={!forceShortLabel && t('article/actionbar/progress/read')}
      title={t('article/actionbar/progress/read')}
      onClick={() => {
        removeDocumentProgress({
          variables: {
            documentId,
          },
        })
      }}
      ref={ref}
      {...props}
    />
  ))

  const MarkAsReadIcon = forwardRef((props, ref) => (
    <IconButton
      Icon={IconCheckSmall}
      title={t('article/actionbar/progress/markasread')}
      onClick={() => {
        upsertDocumentProgress({
          variables: { documentId, percentage: 1, nodeId: '' },
        })
      }}
      ref={ref}
      {...props}
    />
  ))

  const ProgressCircleIcon = () => (
    <ProgressCircle
      progress={percent}
      strokeColorName='text'
      strokePlaceholder
      size={24}
      strokeWidth={2}
    />
  )

  if (percent === 100) {
    if (noCallout) {
      return <ReadIcon />
    } else {
      return (
        <CalloutMenu Element={ReadIcon} padded>
          <IconButton
            Icon={IconHighlightOff}
            title={t('article/actionbar/progress/unread')}
            label={t('article/actionbar/progress/unread')}
            labelShort={t('article/actionbar/progress/unread')}
            onClick={() => {
              removeDocumentProgress({
                variables: {
                  documentId,
                },
              })
            }}
          />
        </CalloutMenu>
      )
    }
  }

  return (
    <>
      <IconButton
        Icon={ProgressCircleIcon}
        onClick={!noScroll ? restoreArticleProgress : undefined}
        href={restoreArticleProgress ? '#' : undefined}
        title={datetime(t, new Date(updatedAt))}
        label={
          forceShortLabel
            ? `${percent}%`
            : t('progress/restore/title', {
                percent: `${percent}%`,
              })
        }
        labelShort={
          forceShortLabel
            ? `${percent}%`
            : t('progress/restore/titleShort', {
                percent: `${percent}%`,
              })
        }
        style={{ marginRight: 10 }}
      />
      {noCallout ? (
        <MarkAsReadIcon />
      ) : (
        <CalloutMenu Element={MarkAsReadIcon} padded>
          <IconButton
            Icon={IconRead}
            title={t('article/actionbar/progress/markasread')}
            label={t('article/actionbar/progress/markasread')}
            labelShort={t('article/actionbar/progress/markasread')}
            onClick={() => {
              upsertDocumentProgress({
                variables: { documentId, percentage: 1, nodeId: '' },
              })
            }}
          />
        </CalloutMenu>
      )}
    </>
  )
}

export default UserProgress
