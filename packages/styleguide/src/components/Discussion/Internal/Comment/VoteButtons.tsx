import React, { useMemo } from 'react'
import { css } from 'glamor'
import IconButton from '../../../IconButton'
import { useColorContext } from '../../../Colors/ColorContext'
import { fontStyles } from '../../../Typography'
import comment from '../../../../templates/Comment'
import { IconBigArrowUp, IconBigArrowDown } from '@republik/icons'

const styles = {
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 12,
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  voteNumber: css({
    ...fontStyles.sansSerifMedium14,
    fontFeatureSettings: '"tnum" 1',
    marginLeft: -4,
  }),
  voteButton: css({
    margin: 0,
  }),
}

type Props = {
  t: any
  comment: any
  disabled?: boolean
  handleUpVote: (commentId: string) => unknown
  handleDownVote: (commentId: string) => unknown
  handleUnVote: (commentId: string) => unknown
}

export const VoteButtons = ({
  t,
  comment,
  disabled = false,
  handleUpVote,
  handleDownVote,
  handleUnVote,
}: Props) => {
  const [colorScheme] = useColorContext()

  const upVoteHandler = comment?.userVote !== 'UP' ? handleUpVote : handleUnVote
  const downVoteHandler =
    comment?.userVote !== 'DOWN' ? handleDownVote : handleUnVote

  return (
    <div {...styles.votes}>
      <div {...styles.vote}>
        <IconButton
          size={22}
          fill={
            comment.userVote === 'UP' ? colorScheme.getCSSColor('text') : 'none'
          }
          Icon={IconBigArrowUp}
          disabled={disabled}
          disabledFill={'none'}
          onClick={() => upVoteHandler(comment.id)}
          title={t('styleguide/CommentActions/upvote')}
        >
          <span
            {...styles.voteNumber}
            title={t.pluralize('styleguide/CommentActions/upvote/count', {
              count: comment.upVotes,
            })}
          >
            {comment.upVotes}
          </span>
        </IconButton>
      </div>
      <div {...styles.vote}>
        <IconButton
          size={22}
          fill={
            comment.userVote === 'DOWN'
              ? colorScheme.getCSSColor('text')
              : 'none'
          }
          Icon={IconBigArrowDown}
          disabled={disabled}
          disabledFill={'none'}
          onClick={() => downVoteHandler(comment.id)}
          title={t('styleguide/CommentActions/downvote')}
          style={{ margin: 0 }}
        >
          <span
            {...styles.voteNumber}
            title={t.pluralize('styleguide/CommentActions/downvote/count', {
              count: comment.downVotes,
            })}
          >
            {comment.downVotes}
          </span>
        </IconButton>
      </div>
    </div>
  )
}
