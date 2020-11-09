export const intersperse = (list, separator) => {
  if (list.length === 0) {
    return []
  }

  return list.slice(1).reduce(
    (items, item, i) => {
      return items.concat([separator(item, i), item])
    },
    [list[0]]
  )
}

export const findTitleLeaf = document => {
  const titleNode = document.children.find(node => node.identifier === 'TITLE')
  if (!titleNode) return

  const heading = titleNode.children.find(
    node => node.type === 'heading' && node.depth === 1
  )
  if (!heading) return

  return heading.children[0]
}
