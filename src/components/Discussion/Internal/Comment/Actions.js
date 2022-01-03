import React, { useMemo } from 'react'
import { css } from 'glamor'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext, formatTimeRelative } from '../../DiscussionContext'
import {
  ShareIcon,
  ReplyIcon,
  DiscussionIcon
} from '../../../Icons'
import { useColorContext } from '../../../Colors/ColorContext'
import { useCurrentMinute } from '../../../../lib/useCurrentMinute'
import IconButton from '../../../IconButton'
import { VoteButtons } from './VoteButtons'

const styles = {
  root: css({
    ...sansSerifMedium14,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-7px'
  }),
  leftActionsWrapper: css({
    display: 'inline-flex',
    marginLeft: 7,
    flexDirection: 'row',
    '& > button:not(:last-child)': {
      marginRight: 14
    }
  })
}

export const Actions = ({ t, comment, onExpand, onReply }) => {
  const { published } = comment
  const { discussion, actions, clock } = React.useContext(DiscussionContext)
  const { displayAuthor, userWaitUntil, userCanComment } = discussion
  const onShare = () => actions.shareComment(comment)

  const now = useCurrentMinute()
  const [colorScheme] = useColorContext()

  const replyBlockedMessage = useMemo(() => {
    const waitUntilDate = userWaitUntil && new Date(userWaitUntil)
    if (waitUntilDate && waitUntilDate > now) {
      return t('styleguide/CommentComposer/wait', {
        time: formatTimeRelative(waitUntilDate, { ...clock, now })
      })
    }
    return null
  }, [userWaitUntil, now])

  return (
    <div {...styles.root} {...colorScheme.set('color', 'text')}>
      <div {...styles.leftActionsWrapper}>
        {onExpand && (
          <IconButton
            onClick={onExpand}
            title={t('styleguide/CommentActions/expand')}
            Icon={DiscussionIcon}
            fillColorName='primary'
            size={20}
            label={
              comment.comments &&
              comment.comments.totalCount > 0 &&
              `${comment.comments.totalCount}`
            }
            labelShort={
              comment.comments &&
              comment.comments.totalCount > 0 &&
              `${comment.comments.totalCount}`
            }
          />
        )}
        {published && (
          <IconButton
            title={t('styleguide/CommentActions/share')}
            Icon={ShareIcon}
            onClick={onShare}
            size={20}
          />
        )}
        {onReply && !!displayAuthor && (
          <IconButton
            disabled={!!replyBlockedMessage}
            onClick={onReply}
            Icon={ReplyIcon}
            size={20}
            title={replyBlockedMessage || t('styleguide/CommentActions/answer')}
            label={t('styleguide/CommentActions/answer')}
            labelShort={t('styleguide/CommentActions/answer')}
          />
        )}
      </div>
      {published && (
        <VoteButtons 
          t={t}
          comment={comment}
          disabled={!userCanComment}
          handleUpVote={id => actions.upvoteComment({ id })}
          handleDownVote={id => actions.downvoteComment({ id })}
          handleUnVote={id => actions.unvoteComment({ id })}
        />
      )}
    </div>
  )
}
