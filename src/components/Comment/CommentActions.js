import React from 'react'
import {css} from 'glamor'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'
import MdKeyboardArrowUp from 'react-icons/lib/md/keyboard-arrow-up'
import UnpublishIcon from 'react-icons/lib/md/delete-sweep'
import EditIcon from 'react-icons/lib/md/edit'
import ReplyIcon from 'react-icons/lib/md/reply'
import colors from '../../theme/colors'
import {Label} from '../Typography'

const config = {
  right: 26,
  left: 20
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      display: 'block'
    }
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    lineHeight: '1',
    marginLeft: 'auto',
  }),
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10
  }),
  iconButton: css({
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    display: 'block',
    cursor: 'pointer',
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
    height: `${config.right}px`,
    width: `${config.right}px`,
    fontSize: `${config.right}px`,
    lineHeight: `${config.right}px`
  }),
  leftButton: css({
    height: `${config.left}px`,
    width: `${config.left}px`,
    fontSize: `${config.left}px`,
    lineHeight: `${config.left}px`
  })
}

export const CommentActions = ({t, score, onAnswer, onEdit, onUnpublish, onUpvote, onDownvote}) => (
  <div {...styles.root}>
    {onAnswer && <IconButton type='left' onClick={onAnswer}
      title={t('styleguide/CommentActions/answer')}>
      <ReplyIcon />
    </IconButton>}
    {onEdit && <IconButton type='left' onClick={onEdit}
      title={t('styleguide/CommentActions/edit')}>
      <EditIcon />
    </IconButton>}
    {onUnpublish && <IconButton type='left' onClick={onUnpublish}
      title={t('styleguide/CommentActions/unpublish')}>
      <UnpublishIcon />
    </IconButton>}

    <div {...styles.actions}>
      <div {...styles.votes}>
        <IconButton onClick={onUpvote} title={t('styleguide/CommentActions/upvote')}>
          <MdKeyboardArrowUp />
        </IconButton>
        <Label>{score}</Label>
        <IconButton onClick={onDownvote} title={t('styleguide/CommentActions/downvote')}>
          <MdKeyboardArrowDown />
        </IconButton>
      </div>
    </div>
  </div>
)

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
