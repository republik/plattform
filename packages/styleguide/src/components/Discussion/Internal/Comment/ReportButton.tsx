import { IconFlagFilled } from '@republik/icons'
import { Flag } from 'lucide-react'
import React from 'react'
import IconButton from '../../../IconButton/discussion-button'

type Props = {
  t: any
  comment: any
  handleReport: (commentId: string, message: string) => unknown
}

export const ReportButton = ({ t, comment, handleReport }: Props) => {
  const openReportDialog = async () => {
    const reportReason = window.prompt(
      'Sind Sie sicher, dass dieser Kommentar gegen die Etikette verstossen hat und Sie die Moderation herbeirufen möchten? Nennen Sie bitte den Grund für diese Meldung.',
    )
    if (reportReason === null) {
      return
    }
    if (reportReason.length === 0) {
      alert(
        'Bitte geben Sie einen Grund an, warum Sie diesen Kommentar melden möchten.',
      )
      return
    }
    const maxLength = 500
    if (reportReason.length > maxLength) {
      alert(
        `Sie können maximal ${maxLength} Zeichen eingeben.\nIhre Eingabe: ${
          reportReason.slice(0, maxLength) + '…'
        }`,
      )
    }

    await handleReport(
      comment.id,
      reportReason?.length > 0 ? reportReason : undefined,
    )
  }

  const alreadyReported =
    comment.userReportedAt || (comment.numReports && comment.numReports > 0)

  return (
    <IconButton
      Icon={alreadyReported ? IconFlagFilled : Flag}
      size={16}
      fill={alreadyReported ? 'error' : undefined}
      disabled={alreadyReported}
      onClick={openReportDialog}
      label={
        comment.numReports && comment.numReports > 0
          ? String(comment.numReports)
          : undefined
      }
      title={
        comment.numReports && comment.numReports > 0
          ? t('styleguide/CommentActions/reportWithAmount', {
              amount: comment.numReports,
            })
          : comment.userReportedAt
          ? t('styleguide/CommentActions/reported')
          : t('styleguide/CommentActions/report')
      }
    />
  )
}
