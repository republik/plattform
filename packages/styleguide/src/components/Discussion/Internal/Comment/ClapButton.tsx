import { IconClap, IconClapFilled } from '@republik/icons'
import React from 'react'
import IconButton from '../../../IconButton'

type Props = {
  t: any
  comment: any
  disabled?: boolean
  handleUpVote: (commentId: string) => unknown
  handleUnVote: (commentId: string) => unknown
}

export const ClapButton = ({
  t,
  comment,
  disabled = false,
  handleUpVote,
  handleUnVote,
}: Props) => {
  const upVoteHandler = comment?.userVote !== 'UP' ? handleUpVote : handleUnVote
  const icon = comment?.userVote === 'UP' ? IconClapFilled : IconClap

  return (
    <IconButton
      active={comment.userVote === 'UP'}
      Icon={icon}
      disabled={disabled}
      onClick={() => upVoteHandler(comment.id)}
      title={t('styleguide/CommentActions/upvote')}
      label={comment?.upVotes || '0'}
      labelShort={comment?.upVotes || '0'}
    />
  )
}
