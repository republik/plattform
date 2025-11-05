import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'
import { ReportCommentHandler } from '../hooks/actions/useReportCommentHandler'
import { UnpublishCommentHandler } from '../hooks/actions/useUnpublishCommentHandler'
import { Dispatch, SetStateAction } from 'react'
import {} from '@project-r/styleguide'
import { timeFormat } from 'd3-time-format'
import {
  IconEdit,
  IconFeatured,
  IconReport,
  IconUnpublish,
} from '@republik/icons'

const dateFormat = timeFormat('%d.%m.%Y')
const hmFormat = timeFormat('%H:%M')

type Options = {
  comment: CommentFragmentType
  actions: {
    reportCommentHandler?: ReportCommentHandler
    unpublishCommentHandler?: UnpublishCommentHandler
    featureCommentHandler?: any
  }
  roles: string[]
  t: any
  setEditMode?: Dispatch<SetStateAction<boolean>>
  checkIfAlreadyReported?: (commentId: string) => boolean
}

function getCommentActions({
  t,
  comment,
  setEditMode,
  roles,
  actions,
  checkIfAlreadyReported,
}: Options) {
  const items = []

  if (
    actions.reportCommentHandler &&
    comment.published &&
    comment.userCanReport
  ) {
    const hasLocalReport = checkIfAlreadyReported
      ? checkIfAlreadyReported(comment.id)
      : false
    items.push({
      icon: IconReport,
      label:
        comment.numReports && comment.numReports > 0
          ? t('styleguide/CommentActions/reportWithAmount', {
              amount: comment.numReports,
            })
          : comment.userReportedAt || hasLocalReport
          ? t('styleguide/CommentActions/reported')
          : t('styleguide/CommentActions/report'),
      // TODO: check against local storage if user is guest
      disabled: !!comment.userReportedAt || hasLocalReport,
      onClick: async () => {
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

        await actions.reportCommentHandler(
          comment.id,
          reportReason?.length > 0 ? reportReason : undefined,
        )
      },
    })
  }

  if (
    roles.includes('editor') &&
    actions.featureCommentHandler &&
    comment.published
  ) {
    items.push({
      icon: IconFeatured,
      label: comment.featuredAt
        ? t('styleguide/CommentActions/featured', {
            date: dateFormat(new Date(comment.featuredAt)),
            time: hmFormat(new Date(comment.featuredAt)),
          })
        : t('styleguide/CommentActions/feature'),
      onClick: async () => {
        await actions.featureCommentHandler(comment)
      },
    })
  }

  if (setEditMode && comment.userCanEdit) {
    items.push({
      icon: IconEdit,
      label: t('styleguide/CommentActions/edit'),
      onClick: () => setEditMode(true),
    })
  }

  const canUnpublish = roles.includes('admin') || roles.includes('moderator')

  if (
    actions.unpublishCommentHandler &&
    comment.published &&
    !comment.adminUnpublished &&
    (canUnpublish || comment.userCanEdit)
  ) {
    items.push({
      icon: IconUnpublish,
      label: t('styleguide/CommentActions/unpublish'),
      onClick: async () => {
        const message = t(
          `styleguide/CommentActions/unpublish/confirm${
            comment.userCanEdit ? '' : '/admin'
          }`,
          {
            name: comment.displayAuthor.name,
          },
        )
        if (!window.confirm(message)) {
          return
        } else {
          return await actions.unpublishCommentHandler(comment.id)
        }
      },
    })
  }

  return items
}

export default getCommentActions
