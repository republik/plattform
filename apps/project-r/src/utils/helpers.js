export const intersperse = (list, separator) => {
  if (list.length === 0) {
    return []
  }

  return list.slice(1).reduce((items, item, i) => {
    return items.concat([separator, item])
  }, [list[0]])
}

// TODO: this is a simplification of 2 republik-frontend functions (same names).
//  Upon occasion, move this helper in SG and import from there in both apps
const splitChildren = (content, start, end) => ({
  ...content,
  children: content.children.slice(start, end)
})

export const splitByTitle = content => {
  const splitIndex = content.children.findIndex(
    node => node.identifier === 'CENTER')
  return {
    title: splitIndex ? splitChildren(content, 0, splitIndex) : null,
    main: splitChildren(content, splitIndex)
  }
}

