import { formatDate, formatTime } from '@/app/lib/util/time-format'
import { EyeOff, Pencil, Star } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'
import { UnpublishCommentHandler } from '../hooks/actions/useUnpublishCommentHandler'

type Options = {
  comment: CommentFragmentType
  actions: {
    unpublishCommentHandler?: UnpublishCommentHandler
    featureCommentHandler?: any
    setEditMode?: Dispatch<SetStateAction<boolean>>
  }
  roles: string[]
  t: any
}

function getCommentActions({ t, comment, roles, actions }: Options) {
  const items = []

  if (
    roles.includes('editor') &&
    actions.featureCommentHandler &&
    comment.published
  ) {
    items.push({
      icon: Star,
      label: comment.featuredAt
        ? t('styleguide/CommentActions/featured', {
            date: formatDate(new Date(comment.featuredAt)),
            time: formatTime(new Date(comment.featuredAt)),
          })
        : t('styleguide/CommentActions/feature'),
      onClick: async () => {
        await actions.featureCommentHandler(comment)
      },
    })
  }

  if (actions.setEditMode && comment.userCanEdit) {
    items.push({
      icon: Pencil,
      label: t('styleguide/CommentActions/edit'),
      onClick: () => actions.setEditMode(true),
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
      icon: EyeOff,
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
