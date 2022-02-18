import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'
import { ReportCommentHandler } from '../hooks/actions/useReportCommentHandler'
import { UnpublishCommentHandler } from '../hooks/actions/useUnpublishCommentHandler'
import { Dispatch, SetStateAction } from 'react'
import {
  EditIcon,
  FeaturedIcon,
  ReportIcon,
  UnpublishIcon,
} from '@project-r/styleguide'
import { timeFormat } from 'd3-time-format'

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
}

function getCommentActions({
  t,
  comment,
  setEditMode,
  roles,
  actions,
}: Options) {
  const items = []

  if (
    actions.reportCommentHandler &&
    comment.published &&
    comment.userCanReport
  ) {
    items.push({
      icon: ReportIcon,
      label:
        comment.numReports && comment.numReports > 0
          ? t('styleguide/CommentActions/reportWithAmount', {
              amount: comment.numReports,
            })
          : comment.userReportedAt
          ? t('styleguide/CommentActions/reported')
          : t('styleguide/CommentActions/report'),
      disabled: !!comment.userReportedAt,
      onClick: async () => {
        if (window.confirm(t('styleguide/CommentActions/reportMessage'))) {
          await actions.reportCommentHandler(comment.id)
        }
      },
    })
  }

  if (
    roles.includes('editor') &&
    actions.featureCommentHandler &&
    comment.published
  ) {
    items.push({
      icon: FeaturedIcon,
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

  if (setEditMode && comment.userCanEdit && !comment.adminUnpublished) {
    items.push({
      icon: EditIcon,
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
      icon: UnpublishIcon,
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
