//
// const TEASER = 'DND_TEASER'
// const INSERT = 'insert'
// const MOVE = 'move'

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

export const getParent = editor => nodeKey => {
  const doc = editor.state.value.document
  return doc.getParent(nodeKey)
}

export const moveUp = editor => (nodeKey, parentKey, index) => {
  editor.change(t => t.moveNodeByKey(nodeKey, parentKey, index - 1))
}

export const moveDown = editor => (nodeKey, parentKey, index) => {
  editor.change(t => t.moveNodeByKey(nodeKey, parentKey, index + 1))
}

export const insert = editor => (parentKey, index, newNode) => {
  editor.change(t => t.insertNodeByKey(parentKey, index, newNode))
}

export const remove = editor => nodeKey => {
  editor.change(t => t.removeNodeByKey(nodeKey))
}
