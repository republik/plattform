const splitChildren = (content, start, end) => {
  return {
    ...content,
    children: content.children.slice(start, end),
  }
}

export const splitByTitle = (content) => {
  let splitIndex =
    content.children.findIndex((node) => node.identifier === 'TITLE') + 1
  if (
    !splitIndex &&
    content.meta &&
    content.meta.template === 'editorialNewsletter'
  ) {
    splitIndex = content.children.findIndex(
      (node) => node.identifier === 'CENTER',
    )
  }
  return {
    title: splitIndex ? splitChildren(content, 0, splitIndex) : null,
    main: splitChildren(content, splitIndex),
  }
}

export const findHighlight = (node, path) =>
  node.highlights.find((highlight) => highlight.path === path)
