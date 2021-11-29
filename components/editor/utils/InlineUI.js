import React, { useEffect, useRef, useState } from 'react'
import { css, merge } from 'glamor'
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
    overflow: 'hidden',
    display: 'flex',
    margin: 0
  }),
  breakoutUI: css({
    top: -35
  })
}

export const MarkButton = props => {
  if (!props.onMouseDown) return null
  return <span {...buttonStyles.mark} {...props} />
}

const InlineUI = ({ editor, node, isMatch, children }) => {
  const ref = useRef()
  const [width, setWidth] = useState(0)
  const isSelected = isMatch(editor.value) && !editor.value.isBlurred

  useEffect(() => {
    setWidth(ref.current?.getBoundingClientRect().width)
  }, [ref, isSelected])

  if (!isSelected) return null

  const getNextParent = currentParent => {
    const allCenters = parent(
      editor.state.value,
      currentParent.key
    ).nodes.filter(n => n.type === 'CENTER')
    const currentCenterIndex = allCenters.indexOf(currentParent)
    if (allCenters.size === 1) {
      return currentParent
    } else if (currentCenterIndex === allCenters.nodes.size - 1) {
      return allCenters[0]
    } else {
      return allCenters[currentCenterIndex + 1]
    }
  }

  const getPreviousParent = currentParent => {
    const allCenters = parent(
      editor.state.value,
      currentParent.key
    ).nodes.filter(n => n.type === 'CENTER')
    const currentCenterIndex = allCenters.indexOf(currentParent)
    if (allCenters.size === 1) {
      return currentParent
    } else if (currentCenterIndex === 0) {
      return allCenters[allCenters.size - 1]
    } else {
      return allCenters[currentCenterIndex - 1]
    }
  }

  const moveHandler = dir => event => {
    event.preventDefault()
    let targetParent = parent(editor.state.value, node.key)
    let targetIndex = targetParent.nodes.indexOf(node) + dir
    if (targetIndex === -1) {
      targetParent = getPreviousParent(targetParent)
      targetIndex = targetParent.nodes.size - 1
    } else if (targetIndex === targetParent.nodes.size) {
      targetParent = getNextParent(targetParent)
      targetIndex = 0
    }
    editor.change(t => t.moveNodeByKey(node.key, targetParent.key, targetIndex))
  }

  const isBreakout =
    !parent(editor.state.value, node.key).type ||
    parent(editor.state.value, node.key).nodes.size === 1

  return (
    <div contentEditable={false} {...styles.uiContainer}>
      <div
        contentEditable={false}
        ref={ref}
        {...merge(styles.ui, isBreakout && styles.breakoutUI)}
        style={{
          left: isBreakout ? 0 : -(width + 15)
        }}
      >
        {!isBreakout && (
          <>
            <MarkButton onMouseDown={moveHandler(-1)}>
              <ArrowUpIcon size={24} />
            </MarkButton>
            <MarkButton onMouseDown={moveHandler(+1)}>
              <ArrowDownIcon size={24} />
            </MarkButton>
          </>
        )}
        {children}
      </div>
    </div>
  )
}

export default InlineUI
