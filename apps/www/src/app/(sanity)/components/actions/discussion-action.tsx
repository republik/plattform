'use client'

import { ArticleDiscussionDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { IconDiscussion } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import Link from 'next/link'
import { ACTION_ICON_SIZE, actionLabelStyle, actionStyle } from './action-style'

const discussionActionStyle = css({
  color: 'primary',
  _hover: { color: 'primaryHover' },
})

export function DiscussionAction({
  path,
  longLabel,
}: {
  path: string
  longLabel?: boolean
}) {
  const { data } = useQuery(ArticleDiscussionDocument, { variables: { path } })

  const meta = data?.document?.meta
  const discussion = meta?.linkedDiscussion ?? meta?.ownDiscussion
  if (!discussion?.path) {
    return null
  }

  const discussionPath =
    meta?.template === 'discussion'
      ? discussion.path
      : `/dialog${discussion.path}`

  return (
    <Link
      className={cx(actionStyle, discussionActionStyle)}
      href={discussionPath}
      title='Zur Diskussion'
    >
      <IconDiscussion size={ACTION_ICON_SIZE} />
      {discussion.comments.totalCount}
      <span className={actionLabelStyle}>
        {longLabel ? 'Beiträge. Reden Sie mit.' : 'Beiträge'}
      </span>
    </Link>
  )
}
