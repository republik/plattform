import React from 'react'
import {css} from 'glamor'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up'
// options: speaker-notes-off, block, clear, visibility-off, remove-circle
import UnpublishIcon from 'react-icons/lib/md/visibility-off'
import EditIcon from 'react-icons/lib/md/edit'
import ReplyIcon from 'react-icons/lib/md/reply'
import ShareIcon from 'react-icons/lib/md/share'
import colors from '../../theme/colors'
import { ellipsize } from '../../lib/styleMixins'
import { Label } from '../Typography'

const config = {
  right: 26,
  left: 20
}

const buttonStyle = {
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '0',
  display: 'block',
  cursor: 'pointer'
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      display: 'block'
    }
  }),
  rightActions: css({
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    lineHeight: '1',
    marginLeft: 'auto'
  }),
  leftActions: css({
    display: 'flex',
    marginRight: 'auto',
    flexWrap: 'nowrap'
  }),
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  voteDivider: css({
    color: colors.disabled,
    padding: '0 2px'
  }),
  iconButton: css({
    ...buttonStyle,
    margin: '0 4px',
    '& svg': {
      margin: '0 auto'
    },

    '&[disabled]': {
      cursor: 'inherit',
      color: colors.disabled
    }
  }),
  rightButton: css({
    display: 'flex',
    justifyContent: 'center',
    height: `${config.right}px`,
    width: '24px',
    fontSize: `${config.right}px`,
    lineHeight: `${config.right}px`,
    margin: 0,
    '& > svg': {
      flexShrink: 0
    }
  }),
  leftButton: css({
    height: `${config.left}px`,
    width: `${config.left}px`,
    fontSize: `${config.left}px`,
    lineHeight: `${config.left}px`
  }),
  collapsed: css({
    borderTop: `1px solid ${colors.primary}`,
    paddingTop: '6px'
  }),
  centerButton: css({
    ...buttonStyle,
    ...ellipsize,
    flex: '1 0 20px'
  }),
  centerLabel: css({
    color: colors.primary
  })
}

export const CommentActions = ({
  t,
  downVotes,
  upVotes,
  onAnswer,
  onEdit,
  onUnpublish,
  onShare,
  onUpvote,
  onDownvote,
  replyBlockedMsg,
  highlighted,
  collapsed,
  onToggleCollapsed
}) => {
  const collapsable = collapsed !== undefined
  const collapseLabel = t(`styleguide/CommentActions/${ collapsed ? 'expand' : 'collapse'}`)
  return (
    <div {...styles.root} {...(collapsable && collapsed && !highlighted && styles.collapsed)}>
      <div {...styles.leftActions}>
      {onAnswer && <IconButton type='left' onClick={replyBlockedMsg ? null : onAnswer}
        title={replyBlockedMsg || t('styleguide/CommentActions/answer')}>
        <ReplyIcon fill={replyBlockedMsg ? colors.disabled : colors.text} />
      </IconButton>}
      {onEdit && <IconButton type='left' onClick={onEdit}
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
      </div>
      {collapsable && (
        <button {...styles.centerButton} onClick={onToggleCollapsed} title={collapseLabel}>
          <Label>
            <span {...styles.centerLabel}>{collapseLabel}</span>
          </Label>
        </button>
        )
      }
      <div {...styles.rightActions}>
        <div {...styles.votes}>
          <div {...styles.vote}>
            <IconButton onClick={onUpvote} title={t('styleguide/CommentActions/upvote')}>
              <MdKeyboardArrowUp />
            </IconButton>
            <Label title={t.pluralize('styleguide/CommentActions/upvote/count', {count: upVotes})}>{upVotes}</Label>
          </div>
          <div {...styles.voteDivider}>/</div>
          <div {...styles.vote}>
          <Label title={t.pluralize('styleguide/CommentActions/downvote/count', {count: downVotes})}>{downVotes}</Label>
            <IconButton onClick={onDownvote} title={t('styleguide/CommentActions/downvote')}>
              <MdKeyboardArrowDown />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// Use the 'iconSize' to adjust the visual weight of the icon. For example
// the 'MdShareIcon' looks much larger next to 'MdKeyboardArrowUp' if both
// have the same dimensions.
//
// The outer dimensions of the action button element is always the same:
// square and as tall as the 'CommentAction' component.
const IconButton = ({iconSize, type = 'right', onClick, title, children}) => (
  <button {...styles.iconButton} {...styles[`${type}Button`]}
    title={title}
    disabled={!onClick}
    onClick={onClick}>
    {children}
  </button>
)

export default CommentActions
