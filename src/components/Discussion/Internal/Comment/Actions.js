import React from 'react'
import { css, merge } from 'glamor'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up'
// options: speaker-notes-off, block, clear, visibility-off, remove-circle
import CommentCountIcon from './CommentCountIcon'
import UnpublishIcon from 'react-icons/lib/md/visibility-off'
import ReportIcon from 'react-icons/lib/md/flag'
import EditIcon from 'react-icons/lib/md/edit'
import ReplyIcon from 'react-icons/lib/md/reply'
import ShareIcon from 'react-icons/lib/md/share'
import colors from '../../../../theme/colors'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext, formatTimeRelative } from '../../DiscussionContext'

const styles = {
  root: css({
    ...sansSerifMedium14,
    color: colors.text,
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
    color: colors.text,
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
    color: colors.text,
    '& svg': {
      margin: '0 auto'
    },
    '&[disabled]': {
      cursor: 'inherit',
      color: colors.disabled
    }
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
  selectedVoteButton: css({
    lineHeight: 1,
    fontSize: '24px',
    textAlign: 'center',
    height: '40px',
    margin: 0,
    color: colors.primary,
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
    color: colors.text,
    marginTop: -1,
    paddingLeft: 4,
    ...sansSerifMedium14
  })
}

export const Actions = ({
  t,
  comment,
  onExpand,
  onReply,
  onEdit,
  onReport
}) => {
  const {
    published,
    userCanEdit,
    downVotes,
    upVotes,
    userVote,
    numReports,
    userReportedAt,
    userCanReport
  } = comment
  const { isAdmin, discussion, actions, clock } = React.useContext(
    DiscussionContext
  )
  const { displayAuthor, userWaitUntil } = discussion

  const onShare = () => actions.shareComment(comment)

  const canUnpublish = (isAdmin || userCanEdit) && published
  const onUnpublish = canUnpublish
    ? () => actions.unpublishComment(comment)
    : undefined

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

  const replyBlockedMessage = (() => {
    const waitUntilDate = userWaitUntil && new Date(userWaitUntil)
    if (waitUntilDate && waitUntilDate > clock.now) {
      return t('styleguide/CommentComposer/wait', {
        time: formatTimeRelative(waitUntilDate, clock)
      })
    }
  })()

  const handleReport = () => {
    if (window.confirm(t('styleguide/CommentActions/reportMessage'))) {
      onReport()
    }
  }

  return (
    <div {...styles.root}>
      {onExpand && (
        <IconButton
          type='left'
          onClick={onExpand}
          title={t('styleguide/CommentActions/expand')}
        >
          <CommentCountIcon
            count={comment.comments && comment.comments.totalCount}
            small={true}
          />
        </IconButton>
      )}
      {onReply && !!displayAuthor && (
        <IconButton
          type='left'
          disabled={!!replyBlockedMessage}
          onClick={onReply}
          title={replyBlockedMessage || t('styleguide/CommentActions/answer')}
        >
          <ReplyIcon
            fill={replyBlockedMessage ? colors.disabled : colors.text}
          />
        </IconButton>
      )}
      {userCanEdit && onEdit && (
        <IconButton
          type='left'
          onClick={onEdit}
          title={t('styleguide/CommentActions/edit')}
        >
          <EditIcon />
        </IconButton>
      )}
      {onUnpublish && (
        <IconButton
          type='left'
          onClick={onUnpublish}
          title={t('styleguide/CommentActions/unpublish')}
        >
          <UnpublishIcon />
        </IconButton>
      )}
      {userCanReport && onReport && (
        <IconButton
          type='left'
          disabled={userReportedAt}
          onClick={handleReport}
          title={t('styleguide/CommentActions/report')}
        >
          <span>
            <ReportIcon fill={userReportedAt ? colors.disabled : colors.text} />
            {numReports > 0 && <span {...styles.text}>{numReports}</span>}
          </span>
        </IconButton>
      )}
      <IconButton
        type='left'
        onClick={onShare}
        title={t('styleguide/CommentActions/share')}
      >
        <ShareIcon />
      </IconButton>
      <div {...styles.votes}>
        <div {...styles.vote}>
          <IconButton
            type={userVote === 'UP' ? 'selectedVote' : 'vote'}
            onClick={onUpvote}
            title={t('styleguide/CommentActions/upvote')}
          >
            <MdKeyboardArrowUp />
          </IconButton>
          <span
            title={t.pluralize('styleguide/CommentActions/upvote/count', {
              count: upVotes
            })}
          >
            {upVotes}
          </span>
        </div>
        <div {...styles.voteDivider}>/</div>
        <div {...styles.vote}>
          <span
            title={t.pluralize('styleguide/CommentActions/downvote/count', {
              count: downVotes
            })}
          >
            {downVotes}
          </span>
          <IconButton
            type={userVote === 'DOWN' ? 'selectedVote' : 'vote'}
            onClick={onDownvote}
            title={t('styleguide/CommentActions/downvote')}
          >
            <MdKeyboardArrowDown />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

const IconButton = ({ type, onClick, title, children }) => (
  <button
    {...merge(styles.iconButton, styles[`${type}Button`])}
    title={title}
    disabled={!onClick}
    onClick={onClick}
  >
    {children}
  </button>
)
