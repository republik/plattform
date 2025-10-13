import { timeFormat } from 'd3-time-format'
import { EyeOff, Star } from 'lucide-react'
import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'
import { UnpublishCommentHandler } from '../hooks/actions/useUnpublishCommentHandler'

const dateFormat = timeFormat('%d.%m.%Y')
const hmFormat = timeFormat('%H:%M')

type Options = {
  comment: CommentFragmentType
  actions: {
    unpublishCommentHandler?: UnpublishCommentHandler
    featureCommentHandler?: any
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
            date: dateFormat(new Date(comment.featuredAt)),
            time: hmFormat(new Date(comment.featuredAt)),
          })
        : t('styleguide/CommentActions/feature'),
      onClick: async () => {
        await actions.featureCommentHandler(comment)
      },
    })
  }

  const canUnpublish = roles.includes('admin') || roles.includes('moderator')

  if (
    actions.unpublishCommentHandler &&
    comment.published &&
    !comment.adminUnpublished &&
    canUnpublish
  ) {
    items.push({
      icon: EyeOff,
      label: t('styleguide/CommentActions/unpublish'),
      onClick: async () => {
        const message = t('styleguide/CommentActions/unpublish/confirm/admin', {
          name: comment.displayAuthor.name,
        })
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
