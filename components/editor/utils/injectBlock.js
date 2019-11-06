export default (change, block) => {
  const {
    value: { startBlock, endBlock }
  } = change
  if (startBlock === endBlock && !startBlock.text) {
    change.replaceNodeByKey(startBlock.key, block)

    const node = change.value.document.getNode(block.key)
    if (node) change.collapseToEndOf(node)

    return change
  }
  return change.insertBlock(block)
}
