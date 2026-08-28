'use client'

import { DiscussionByIdDocument } from '#graphql/republik-api/__generated__/gql/graphql'
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
  backendDiscussionId,
  inlineDiscussion,
  longLabel,
}: {
  path: string
  backendDiscussionId?: string | null
  inlineDiscussion?: boolean
  longLabel?: boolean
}) {
  const { data } = useQuery(DiscussionByIdDocument, {
    variables: { id: backendDiscussionId! },
    skip: !backendDiscussionId,
  })

  const discussion = data?.discussion
  if (!discussion?.path) {
    return null
  }

  const discussionPath = inlineDiscussion ? path : `/dialog${discussion.path}`

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