export default (change, block) => {
  const { state: {startBlock, endBlock} } = change
  if (startBlock === endBlock && !startBlock.text) {
    change.replaceNodeByKey(startBlock.key, block)

    const node = change.state.document.getNode(block.key)
    if (node) change.collapseToEndOf(node)

    return change
  }
  return change.insertBlock(block)
}
