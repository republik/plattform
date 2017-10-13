import React from 'react'
import {css} from 'glamor'
import {MdShare, MdKeyboardArrowDown, MdKeyboardArrowUp, MdMoreHoriz} from 'react-icons/lib/md'
import {Label} from '../Typography'

const commentActionsConfig = {
  height: 26
}

const commentActionsStyles = {
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
  })
}

export const CommentActions = ({score, onAnswer, onUpvote, onDownvote}) => (
  <div {...commentActionsStyles.root}>
    <button {...commentActionsStyles.replyButton} onClick={onAnswer}>
      <Label>
        Antworten
      </Label>
    </button>

    <div {...commentActionsStyles.actions}>
      <ActionButton iconSize={18}>
        <MdShare />
      </ActionButton>
      <ActionButton iconSize={18}>
        <MdMoreHoriz />
      </ActionButton>
      <div {...commentActionsStyles.votes}>
        <ActionButton iconSize={commentActionsConfig.height} onClick={onUpvote}>
          <MdKeyboardArrowUp />
        </ActionButton>
        <Label>{score}</Label>
        <ActionButton iconSize={commentActionsConfig.height} onClick={onDownvote}>
          <MdKeyboardArrowDown />
        </ActionButton>
      </div>
    </div>
  </div>
)

const actionButtonStyles = {
  root: css({
    '-webkit-appearance': 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    display: 'block',
    height: `${commentActionsConfig.height}px`,
    width: `${commentActionsConfig.height}px`,
    fontSize: '18px',
    lineHeight: `${commentActionsConfig.height}px`,
    cursor: 'pointer',
    margin: '0 4px',
    '& svg': {
      margin: '0 auto'
    }
  })
}

// Use the 'iconSize' to adjust the visual weight of the icon. For example
// the 'MdShareIcon' looks much larger next to 'MdKeyboardArrowUp' if both
// have the same dimensions.
//
// The outer dimensions of the action button element is always the same:
// square and as tall as the 'CommentAction' component.
const ActionButton = ({iconSize, children}) => (
  <button {...actionButtonStyles.root} style={{fontSize: `${iconSize}px`}}>
    {children}
  </button>
)

export default CommentActions
