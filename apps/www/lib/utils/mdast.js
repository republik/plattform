import { mdastToString } from '@project-r/styleguide'

const TRUNCATE_AFTER_CHARS = 700

const splitChildren = (content, start, end) => {
  return {
    ...content,
    children: content.children.slice(start, end),
  }
}

const splitChildrenTruncated = (
  content,
  start,
  charsCutoff = TRUNCATE_AFTER_CHARS,
) => {
  const center = content.children[start]
  const centerChildren = center.children.reduce(
    (acc, node) => {
      if (acc.chars < charsCutoff) {
        acc.children.push(node)
        acc.chars += mdastToString(node).length
      }
      return acc
    },
    { children: [], chars: 0 },
  )
  return {
    ...content,
    children: [
      {
        ...center,
        children: centerChildren,
      },
    ],
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
    mainTruncated: splitChildrenTruncated(content, splitIndex),
  }
}

export const findHighlight = (node, path) =>
  node.highlights.find((highlight) => highlight.path === path)
