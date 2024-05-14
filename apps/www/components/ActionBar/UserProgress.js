import { forwardRef } from 'react'
import { css } from 'glamor'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'

import withT from '../../lib/withT'
import datetime from '../Article/Progress/datetime'

import { withProgressApi } from '../Article/Progress/api'
import {
  ProgressCircle,
  IconButton,
  CalloutMenu,
  Label,
} from '@project-r/styleguide'
import { getFeatureDescription } from '../Article/Progress'
import { IconCheckSmall, IconHighlightOff, IconRead } from '@republik/icons'

const styles = {
  consent: css({
    marginTop: 16,
  }),
}

const UserProgress = (
  {
    t,
    documentId,
    userProgress,
    upsertDocumentProgress,
    removeDocumentProgress,
    revokeProgressConsent,
    submitProgressConsent,
    forceShortLabel,
    noCallout,
    noScroll,
    displayMinutes,
  },
  { restoreArticleProgress, showConsentPrompt },
) => {
  // Renders the Progress Consent Form as a Callout in the Article Top Actionbar
  if (showConsentPrompt && !noCallout) {
    const ProgressConsentIcon = forwardRef((props, ref) => (
      <IconButton
        Icon={() => <ProgressCircle progress={66} />}
        label={t('article/progressprompt/headline')}
        labelShort={t('article/progressprompt/headline')}
        ref={ref}
        {...props}
      />
    ))
    return (
      <CalloutMenu Element={ProgressConsentIcon} padded>
        <Label>{getFeatureDescription(t)}</Label>
        <div {...styles.consent}>
          <IconButton
            style={{ marginBottom: 16 }}
            Icon={IconRead}
            onClick={submitProgressConsent}
            label={t('article/progressprompt/button/confirm')}
            labelShort={t('article/progressprompt/button/confirm')}
          />
          <IconButton
            Icon={IconHighlightOff}
            onClick={revokeProgressConsent}
            label={t('article/progressprompt/button/reject')}
            labelShort={t('article/progressprompt/button/reject')}
          />
        </div>
      </CalloutMenu>
    )
  }

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
        removeDocumentProgress(documentId)
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
        upsertDocumentProgress(documentId, 1, '')
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
              removeDocumentProgress(documentId)
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
              upsertDocumentProgress(documentId, 1, '')
            }}
          />
        </CalloutMenu>
      )}
    </>
  )
}

UserProgress.contextTypes = {
  restoreArticleProgress: PropTypes.func,
  showConsentPrompt: PropTypes.bool,
}

export default compose(withT, withProgressApi)(UserProgress)
