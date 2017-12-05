export default ({ matchSource, matchUrl, getQueryParams, TYPE }) => ({
  onKeyDown (event, change) {
    if (event.key !== 'Enter') return
    if (event.shiftKey !== false) return

    const { value } = change
    if (!value.isCollapsed) return

    const block = value.blocks.first()

    if (!block || !matchSource(block)) return

    const text = block.text

    if (!text) return

    const url = text.trim()

    if (matchUrl(url)) {
      const parent = value.document.getParent(block.key)
      const newNode = {
        kind: 'block',
        type: TYPE,
        data: {
          queryParams: getQueryParams(url),
          url
        },
        isVoid: true
      }

      event.preventDefault()
      return change
        .insertNodeByKey(
          parent.key,
          parent.nodes.indexOf(block),
          newNode
        )
        .collapseToStartOf(block)
        .extendToEndOf(block)
        .delete()
    }
  }
})
