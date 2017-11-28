import { DragSource, DropTarget } from 'react-dnd'

const TEASER = 'DND_TEASER'
const INSERT = 'insert'
const MOVE = 'move'

const moveTeaserSource = {
  beginDrag (props) {
    return {
      nodeKey: props.nodeKey,
      index: props.getIndex(props.nodeKey),
      parentKey: props.getParentKey(props.nodeKey),
      operation: MOVE
    }
  }
}

const insertTeaserSource = {
  beginDrag (props) {
    return {
      newItem: props.getNewItem(props),
      operation: INSERT
    }
  }
}

const teaserTarget = {
  drop (props, monitor) {
    const draggedItem = monitor.getItem()
    const { targetKey } = props
    const newParentKey = props.getParentKey(targetKey)
    const newIndex = props.getIndex(targetKey)
    if (draggedItem.operation === MOVE) {
      props.move(draggedItem.sourceKey, newParentKey, newIndex)
    } else {
      props.insert(newParentKey, newIndex, draggedItem.newItem)
    }
  }
}

export const createDropTarget = DropTarget(TEASER, teaserTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))

export const createInsertDragSource = DragSource(TEASER, insertTeaserSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))

export const createMoveDragSource = DragSource(TEASER, moveTeaserSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))

export const getIndex = editor => nodeKey => {
  const doc = editor.state.value.document
  let index
  doc.findDescendant((node, i) => {
    if (node.key === nodeKey) {
      index = i
      return true
    }
  })
  return index
}

export const getParentKey = editor => nodeKey => {
  const doc = editor.state.value.document
  return doc.getParent(nodeKey)
}

export const move = editor => (nodeKey, parentKey, index) => {
  editor.onChange(
    editor.state.value.change().moveNodeByKey(nodeKey, parentKey, index)
  )
}

export const insert = editor => (parentKey, index, newNode) => {
  editor.onChange(
    editor.state.value.change().insertNodeByKey(parentKey, index, newNode)
  )
}
