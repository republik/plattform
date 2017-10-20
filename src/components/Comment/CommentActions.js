import React from 'react'
import {css} from 'glamor'
import {MdShare, MdKeyboardArrowDown, MdKeyboardArrowUp, MdMoreHoriz} from 'react-icons/lib/md'
import colors from '../../theme/colors'
import {Label} from '../Typography'

const config = {
  height: 26
}

const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& svg': {
      display: 'block'
    }
  }),
  replyButton: css({
    '-webkit-appearance': 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer'
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    lineHeight: '1'
  }),
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10
  }),
  actionButton: css({
    '-webkit-appearance': 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    display: 'block',
    height: `${config.height}px`,
    width: `${config.height}px`,
    fontSize: '18px',
    lineHeight: `${config.height}px`,
    cursor: 'pointer',
    margin: '0 4px',
    '& svg': {
      margin: '0 auto'
    },

    '&[disabled]': {
      cursor: 'inherit',
      color: colors.disabled
    }
  })
}

export const CommentActions = ({t, score, onAnswer, onUpvote, onDownvote}) => (
  <div {...styles.root}>
    <button {...styles.replyButton} onClick={onAnswer}>
      <Label>
        {t('styleguide/CommentActions/answer')}
      </Label>
    </button>

    <div {...styles.actions}>
      <ActionButton iconSize={18}>
        <MdShare />
      </ActionButton>
      <ActionButton iconSize={18}>
        <MdMoreHoriz />
      </ActionButton>
      <div {...styles.votes}>
        <ActionButton iconSize={config.height} onClick={onUpvote}>
          <MdKeyboardArrowUp />
        </ActionButton>
        <Label>{score}</Label>
        <ActionButton iconSize={config.height} onClick={onDownvote}>
          <MdKeyboardArrowDown />
        </ActionButton>
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
const ActionButton = ({iconSize, onClick, children}) => (
  <button {...styles.actionButton} style={{fontSize: `${iconSize}px`}} disabled={!onClick} onClick={onClick}>
    {children}
  </button>
)

export default CommentActions
