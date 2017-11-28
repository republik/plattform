import { DragSource, DropTarget } from 'react-dnd'

const TEASER = 'DND_TEASER'
const INSERT = 'insert'
const MOVE = 'move'

const endDrag = (props, monitor) => {
  if (!monitor.didDrop()) {
    return
  }
  const draggedItem = monitor.getItem()
  const {
    nodeKey: targetKey,
    getParentKey,
    getIndex,
    move,
    insert
  } = monitor.getDropResult()
  const newParentKey = getParentKey(targetKey)
  const newIndex = getIndex(targetKey)
  if (draggedItem.operation === MOVE) {
    move(draggedItem.nodeKey, newParentKey, newIndex)
  } else {
    insert(newParentKey, newIndex, draggedItem.newItem)
  }
}

const moveTeaserSource = {
  beginDrag (props) {
    return {
      nodeKey: props.nodeKey,
      index: props.getIndex(props.nodeKey),
      parentKey: props.getParentKey(props.nodeKey),
      operation: MOVE
    }
  },
  endDrag
}

const insertTeaserSource = {
  beginDrag (props) {
    return {
      newItem: props.getNewItem(props),
      operation: INSERT
    }
  },
  endDrag
}

const teaserTarget = {
  canDrop (props, monitor) {
    return props.nodeKey !== monitor.getItem().nodeKey
  },

  drop (props) {
    return props
  }
}

export const createDropTarget = DropTarget(
  TEASER,
  teaserTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
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
  return doc.getParent(nodeKey).key
}

export const move = editor => (nodeKey, parentKey, index) => {
  editor.change(t => t.moveNodeByKey(nodeKey, parentKey, index))
}

export const insert = editor => (parentKey, index, newNode) => {
  editor.change(t => t.insertNodeByKey(parentKey, index, newNode))
}
