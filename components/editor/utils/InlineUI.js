import React from 'react'
import { css } from 'glamor'
import buttonStyles from './buttonStyles'
import { parent } from './selection'
import ArrowUpIcon from 'react-icons/lib/md/arrow-upward'
import ArrowDownIcon from 'react-icons/lib/md/arrow-downward'

const styles = {
  uiContainer: css({
    position: 'relative',
    height: 0,
    overflow: 'visible'
  }),
  ui: css({
    position: 'absolute',
    zIndex: 10,
    left: -75,
    overflow: 'hidden',
    display: 'flex',
    margin: 0
  })
}

export const MarkButton = props => {
  if (!props.onMouseDown) return null
  return <span {...buttonStyles.mark} {...props} />
}

const InlineUI = ({ editor, node, isMatch, children, style }) => {
  const isSelected = isMatch
    ? isMatch(editor.value) && !editor.value.isBlurred
    : true
  const isBreakout = parent(editor.state.value, node.key).nodes.size === 1
  if (!isSelected || isBreakout) return null

  const moveHandler = dir => event => {
    const parentNode = parent(editor.state.value, node.key)
    const nextIndex = parentNode.nodes.indexOf(node) + dir
    const correctedIndex =
      nextIndex === -1
        ? parentNode.nodes.size - 1
        : nextIndex % (parentNode.nodes.size - 1)
    event.preventDefault()
    editor.change(t =>
      t.moveNodeByKey(node.key, parentNode.key, correctedIndex)
    )
  }

  return (
    <div contentEditable={false} {...styles.uiContainer}>
      <div contentEditable={false} {...styles.ui} style={style}>
        <MarkButton onMouseDown={moveHandler(-1)}>
          <ArrowUpIcon size={24} />
        </MarkButton>
        <MarkButton onMouseDown={moveHandler(+1)}>
          <ArrowDownIcon size={24} />
        </MarkButton>
        {children}
      </div>
    </div>
  )
}

export default InlineUI
