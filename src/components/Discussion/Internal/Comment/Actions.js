import React from 'react'
import { css } from 'glamor'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up'
// options: speaker-notes-off, block, clear, visibility-off, remove-circle
import UnpublishIcon from 'react-icons/lib/md/visibility-off'
import EditIcon from 'react-icons/lib/md/edit'
import ReplyIcon from 'react-icons/lib/md/reply'
import ShareIcon from 'react-icons/lib/md/share'
import colors from '../../../../theme/colors'
import { sansSerifMedium14 } from '../../../Typography/styles'
import { DiscussionContext } from '../../DiscussionContext'

const buttonStyle = {
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '0',
  display: 'block',
  cursor: 'pointer',
  height: '100%'
}

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
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  voteDivider: css({
    color: colors.text,
    padding: '0 2px'
  }),
  iconButton: css({
    ...buttonStyle,
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
    },
  }),
  leftButton: css({
    ...buttonStyle,
    fontSize: '18px',
    padding: '0 7px',
  })
}

export const Actions = ({ t, comment, onReply, onEdit }) => {
  const { id, published, userCanEdit, downVotes, upVotes, userVote } = comment
  const { isAdmin, discussion: { displayAuthor, userWaitUntil }, actions, clock } = React.useContext(DiscussionContext)

  const onUnpublish = ((isAdmin || userCanEdit) && published) ? (() => { actions.unpublishComment(id) }) : undefined
  const onShare = () => { actions.shareComment(id) }
  const onUpvote = (!displayAuthor || userVote === 'DOWN') ? undefined : () => { actions.upvoteComment(id) }
  const onDownvote = (!displayAuthor || userVote === 'UP') ? undefined : () => { actions.downvoteComment(id) }

  const replyBlockedMessage = (() => {
    const waitUntilDate = userWaitUntil && new Date(userWaitUntil)
    if (waitUntilDate && waitUntilDate > clock.now) {
      return t('styleguide/CommentComposer/wait', { time: clock.timeAhead(+waitUntilDate) })
    }
  })()

  return (
    <div {...styles.root}>
      {onReply && <IconButton type='left' onClick={replyBlockedMessage ? null : onReply}
        title={replyBlockedMessage || t('styleguide/CommentActions/answer')}>
        <ReplyIcon fill={replyBlockedMessage ? colors.disabled : colors.text} />
      </IconButton>}
      {userCanEdit && onEdit && <IconButton type='left' onClick={onEdit}
        title={t('styleguide/CommentActions/edit')}>
        <EditIcon />
      </IconButton>}
      {onUnpublish && <IconButton type='left' onClick={onUnpublish}
        title={t('styleguide/CommentActions/unpublish')}>
        <UnpublishIcon />
      </IconButton>}
      {onShare && <IconButton type='left' onClick={onShare}
        title={t('styleguide/CommentActions/share')}>
        <ShareIcon />
      </IconButton>}
      <div {...styles.votes}>
        <div {...styles.vote}>
          <IconButton type='vote' onClick={onUpvote} title={t('styleguide/CommentActions/upvote')}>
            <MdKeyboardArrowUp />
          </IconButton>
          <span title={t.pluralize('styleguide/CommentActions/upvote/count', { count: upVotes })}>{upVotes}</span>
        </div>
        <div {...styles.voteDivider}>/</div>
        <div {...styles.vote}>
          <span title={t.pluralize('styleguide/CommentActions/downvote/count', { count: downVotes })}>{downVotes}</span>
          <IconButton type='vote' onClick={onDownvote} title={t('styleguide/CommentActions/downvote')}>
            <MdKeyboardArrowDown />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

const IconButton = ({ type, onClick, title, children }) => (
  <button {...styles.iconButton} {...styles[`${type}Button`]}
    title={title}
    disabled={!onClick}
    onClick={onClick}>
    {children}
  </button>
)
