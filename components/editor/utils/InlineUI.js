import React from 'react'
import { colors, P } from '@project-r/styleguide'
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
    margin: 0,
    padding: 0,
    left: -87,
    overflow: 'hidden'
  }),
  uiInlineRow: css({
    backgroundColor: '#fff',
    border: `1px solid ${colors.divider}`,
    padding: '5px',
    display: 'inline-block',
    margin: 0
  })
}

const MarkButton = props => {
  if (!props.onMouseDown) return null
  return <span {...buttonStyles.mark} {...props} />
}

const InlineUI = ({ editor, node, TYPE, subModules }) => {
  const isInfoboxBlock = block =>
    block.type === TYPE || subModules?.some(m => m.TYPE === block.type)
  const isSelected =
    editor.value.blocks.some(isInfoboxBlock) && !editor.value.isBlurred
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
      <div contentEditable={false} {...styles.ui}>
        <P {...styles.uiInlineRow}>
          <MarkButton onMouseDown={moveHandler(-1)}>
            <ArrowUpIcon size={24} />
          </MarkButton>
          <MarkButton onMouseDown={moveHandler(+1)}>
            <ArrowDownIcon size={24} />
          </MarkButton>
        </P>
      </div>
    </div>
  )
}

export default InlineUI
