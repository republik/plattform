import { IconKeyboardArrowDown, IconKeyboardArrowUp } from '@republik/icons'
import { css } from 'glamor'
import React from 'react'
import { useColorContext } from '../../../Colors/ColorContext'
import IconButton from '../../../IconButton'
import { fontStyles } from '../../../Typography'

const styles = {
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto',
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  voteNumber: css({
    ...fontStyles.sansSerifMedium14,
    fontFeatureSettings: '"tnum" 1',
  }),
  voteDivider: css({
    padding: '0 2px',
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
          size={24}
          fill={comment.userVote === 'UP' && colorScheme.getCSSColor('primary')}
          Icon={IconKeyboardArrowUp}
          disabled={disabled}
          onClick={() => upVoteHandler(comment.id)}
          title={t('styleguide/CommentActions/upvote')}
          style={{ margin: 0 }}
        />
        <span
          {...styles.voteNumber}
          title={t.pluralize('styleguide/CommentActions/upvote/count', {
            count: comment.upVotes,
          })}
        >
          {comment.upVotes}
        </span>
      </div>
      <div {...styles.voteDivider} {...colorScheme.set('color', 'text')}>
        /
      </div>
      <div {...styles.vote}>
        <span
          {...styles.voteNumber}
          title={t.pluralize('styleguide/CommentActions/downvote/count', {
            count: comment.downVotes,
          })}
        >
          {comment.downVotes}
        </span>
        <IconButton
          size={24}
          fill={
            comment.userVote === 'DOWN' && colorScheme.getCSSColor('primary')
          }
          Icon={IconKeyboardArrowDown}
          disabled={disabled}
          onClick={() => downVoteHandler(comment.id)}
          title={t('styleguide/CommentActions/downvote')}
          style={{ margin: 0 }}
        />
      </div>
    </div>
  )
}
