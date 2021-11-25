import React, { useMemo } from 'react'
import { css, merge } from 'glamor'
// options: speaker-notes-off, block, clear, visibility-off, remove-circle
import CommentCountIcon from './CommentCountIcon'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext, formatTimeRelative } from '../../DiscussionContext'
import {
  ShareIcon,
  ReplyIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '../../../Icons'
import { useColorContext } from '../../../Colors/ColorContext'
import { useCurrentMinute } from '../../../../lib/useCurrentMinute'
import OGIconButton from '../../../IconButton'

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
  iconButton: css({
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    display: 'block',
    cursor: 'pointer',
    height: '100%',
    '& svg': {
      margin: '0 auto'
    }
  }),
  iconButtonLabel: css({
    marginLeft: '10px',
    fontSize: '14px'
  }),
  voteButton: css({
    lineHeight: 1,
    fontSize: '24px',
    textAlign: 'center',
    height: '40px',
    margin: 0,
    '& > svg': {
      display: 'block',
      flexShrink: 0
    }
  }),
  leftButton: css({
    fontSize: '18px',
    padding: '0 7px'
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
          >
            <CommentCountIcon
              count={comment.comments && comment.comments.totalCount}
              small={true}
            />
          </IconButton>
        )}
        {published && (
          <OGIconButton
            title={t('styleguide/CommentActions/share')}
            Icon={ShareIcon}
            onClick={onShare}
            size={18}
            noMargin
          />
        )}
        {onReply && !!displayAuthor && (
          /*
          <ReplyIconButton
            onReply={onReply}
            colorScheme={colorScheme}
            t={t}
            userWaitUntil={userWaitUntil}
            clock={clock}
          />*/
          <OGIconButton
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
              selected={userVote === 'UP'}
              vote={true}
              onClick={onUpvote}
              title={t('styleguide/CommentActions/upvote')}
            >
              <ArrowUpIcon />
            </IconButton>
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
              selected={userVote === 'DOWN'}
              vote={true}
              onClick={onDownvote}
              title={t('styleguide/CommentActions/downvote')}
            >
              <ArrowDownIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  )
}

const IconButton = ({ vote, selected, onClick, title, label, children }) => {
  const [colorScheme] = useColorContext()
  const iconButtonStyleRules = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor(selected ? 'primary' : 'text'),
        '&[disabled]': {
          cursor: 'inherit',
          color: colorScheme.getCSSColor('disabled')
        }
      }),
    [colorScheme, selected]
  )
  return (
    <button
      {...merge(
        styles.iconButton,
        vote ? styles.voteButton : styles.leftButton
      )}
      {...iconButtonStyleRules}
      title={title}
      disabled={!onClick}
      onClick={onClick}
    >
      {children}
      {label && <span {...styles.iconButtonLabel}>{label}</span>}
    </button>
  )
}
