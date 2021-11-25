import React, { useMemo } from 'react'
import { css } from 'glamor'
// options: speaker-notes-off, block, clear, visibility-off, remove-circle
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext, formatTimeRelative } from '../../DiscussionContext'
import {
  ShareIcon,
  ReplyIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  DiscussionIcon
} from '../../../Icons'
import { useColorContext } from '../../../Colors/ColorContext'
import { useCurrentMinute } from '../../../../lib/useCurrentMinute'
import IconButton from '../../../IconButton'

const styles = {
  root: css({
    ...sansSerifMedium14,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-7px'
  }),
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto'
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  voteDivider: css({
    padding: '0 2px'
  }),
  text: css({
    display: 'inline-block',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    verticalAlign: 'middle',
    marginTop: -1,
    paddingLeft: 4,
    ...sansSerifMedium14
  }),
  leftActionsWrapper: css({
    display: 'inline-flex',
    flexDirection: 'row',
    '& > button:not(:last-child)': {
      marginRight: 14
    }
  })
}

export const Actions = ({ t, comment, onExpand, onReply }) => {
  const { published, downVotes, upVotes, userVote } = comment
  const { discussion, actions, clock } = React.useContext(DiscussionContext)
  const { displayAuthor, userWaitUntil } = discussion
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

  /*
   * The onClick functions are wired up such that when the user clicks a particular button twice,
   * they effectively undo their vote. Eg. if the user clicks on 'downvote', then a second
   * click on the downvote icon will 'unvote' their choice.
   */
  const { onUpvote, onDownvote } = (() => {
    if (!displayAuthor) {
      return { onUpvote: undefined, onDownvote: undefined }
    } else if (userVote === 'UP') {
      return {
        onUpvote: () => actions.unvoteComment(comment),
        onDownvote: () => actions.downvoteComment(comment)
      }
    } else if (userVote === 'DOWN') {
      return {
        onUpvote: () => actions.upvoteComment(comment),
        onDownvote: () => actions.unvoteComment(comment)
      }
    } else {
      return {
        onUpvote: () => actions.upvoteComment(comment),
        onDownvote: () => actions.downvoteComment(comment)
      }
    }
  })()

  return (
    <div {...styles.root} {...colorScheme.set('color', 'text')}>
      <div {...styles.leftActionsWrapper}>
        {onExpand && (
          <IconButton
            onClick={onExpand}
            title={t('styleguide/CommentActions/expand')}
            Icon={DiscussionIcon}
            fillColorName={'primary'}
            size={18}
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
            size={18}
            noMargin
          />
        )}
        {onReply && !!displayAuthor && (
          <IconButton
            disabled={!!replyBlockedMessage}
            onClick={onReply}
            Icon={ReplyIcon}
            size={18}
            title={replyBlockedMessage || t('styleguide/CommentActions/answer')}
            label={t('styleguide/CommentActions/answer')}
          />
        )}
      </div>
      {published && (
        <div {...styles.votes}>
          <div {...styles.vote}>
            <IconButton
              size={24}
              fill={userVote === 'UP' && colorScheme.getCSSColor('primary')}
              Icon={ArrowUpIcon}
              onClick={onUpvote}
              title={t('styleguide/CommentActions/upvote')}
              noMargin
            />
            <span
              title={t.pluralize('styleguide/CommentActions/upvote/count', {
                count: upVotes
              })}
            >
              {upVotes}
            </span>
          </div>
          <div {...styles.voteDivider} {...colorScheme.set('color', 'text')}>
            /
          </div>
          <div {...styles.vote}>
            <span
              title={t.pluralize('styleguide/CommentActions/downvote/count', {
                count: downVotes
              })}
            >
              {downVotes}
            </span>
            <IconButton
              size={24}
              fill={userVote === 'DOWN' && colorScheme.getCSSColor('primary')}
              Icon={ArrowDownIcon}
              onClick={onDownvote}
              title={t('styleguide/CommentActions/downvote')}
              noMargin
            />
          </div>
        </div>
      )}
    </div>
  )
}
