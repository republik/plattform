import { useEffect, useRef, useState } from 'react'
import { css, merge } from 'glamor'
import buttonStyles from './buttonStyles'
import { parent } from './selection'
import {
  IconArrowUpward,
  IconArrowDownward
} from '@republik/icons'
import scrollIntoView from 'scroll-into-view'

const styles = {
  uiContainer: css({
    position: 'relative',
    height: 0,
    overflow: 'visible',
  }),
  ui: css({
    position: 'absolute',
    zIndex: 10,
    overflow: 'hidden',
    display: 'flex',
    margin: 0,
  }),
  breakoutUI: css({
    top: -35,
  }),
}

export const MarkButton = (props) => {
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

  const getAllCenters = (currentParent) => {
    const allCenters = parent(
      editor.state.value,
      currentParent.key,
    ).nodes.filter((n) => n.type === 'CENTER')
    return {
      allCenters,
      currentCenterIndex: allCenters.indexOf(currentParent),
    }
  }

  const getNextParent = (currentParent) => {
    const { allCenters, currentCenterIndex } = getAllCenters(currentParent)
    if (allCenters.size === 1) {
      return currentParent
    } else if (currentCenterIndex === allCenters.size - 1) {
      return allCenters.get(0)
    } else {
      return allCenters.get(currentCenterIndex + 1)
    }
  }

  const getPreviousParent = (currentParent) => {
    const { allCenters, currentCenterIndex } = getAllCenters(currentParent)
    if (allCenters.size === 1) {
      return currentParent
    } else if (currentCenterIndex === 0) {
      return allCenters.get(allCenters.size - 1)
    } else {
      return allCenters.get(currentCenterIndex - 1)
    }
  }

  const moveHandler = (dir) => (event) => {
    event.preventDefault()
    const rect = ref.current.getBoundingClientRect()
    const top = (rect.top + rect.height / 2) / window.innerHeight
    let targetParent = parent(editor.state.value, node.key)
    let targetIndex = targetParent.nodes.indexOf(node) + dir
    if (targetIndex === -1) {
      targetParent = getPreviousParent(targetParent)
      targetIndex = targetParent.nodes.size
    } else if (targetIndex === targetParent.nodes.size - 1) {
      targetParent = getNextParent(targetParent)
      targetIndex = 0
    }
    editor.change((t) =>
      t.moveNodeByKey(node.key, targetParent.key, targetIndex),
    )
    setTimeout(() => {
      scrollIntoView(ref.current, {
        time: 0,
        align: {
          top,
        },
      })
    }, 0)
  }

  const currentParent = parent(editor.state.value, node.key)
  const showMoveUI = currentParent.type && currentParent.type === 'CENTER'

  return (
    <div contentEditable={false} {...styles.uiContainer}>
      <div
        contentEditable={false}
        ref={ref}
        {...merge(styles.ui, !showMoveUI && styles.breakoutUI)}
        style={{
          left: !showMoveUI ? 0 : -(width + 15),
        }}
      >
        {showMoveUI && (
          <>
            <MarkButton onMouseDown={moveHandler(-1)}>
              <IconArrowUpward size={24} />
            </MarkButton>
            <MarkButton onMouseDown={moveHandler(+1)}>
              <IconArrowDownward size={24} />
            </MarkButton>
          </>
        )}
        {children}
      </div>
    </div>
  )
}

export default InlineUI
