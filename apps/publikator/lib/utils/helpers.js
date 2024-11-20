import { swissTime } from './format'

export const intersperse = (list, separator) => {
  if (list.length === 0) {
    return []
  }

  return list.slice(1).reduce(
    (items, item, i) => {
      return items.concat([separator(item, i), item])
    },
    [list[0]],
  )
}

const findTitleNode = (document) =>
  document.children.find((node) => node.identifier === 'TITLE')

export const findTitleLeaf = (document) => {
  const titleNode = findTitleNode(document)
  if (!titleNode) return

  const heading = titleNode.children.find(
    (node) => node.type === 'heading' && node.depth === 1,
  )
  if (!heading) return

  return heading.children[0]
}

export const findAuthorsP = (document) => {
  const titleNode = findTitleNode(document)
  if (
    !titleNode ||
    titleNode.children.length !== 4 ||
    titleNode.children[3].type !== 'paragraph'
  )
    return

  return titleNode.children[3]
}

export const mdastToString = (node) =>
  node
    ? node.value ||
      (node.children && node.children.map(mdastToString).join('')) ||
      ''
    : ''

const pubDateFormat = swissTime.format('%d.%m.%Y')

export const generateAuthorsLine = (me) =>
  `Von ${me ? `[${me.name}](/~${me.id})` : '[Autor](<>)'}, ${pubDateFormat(
    new Date(),
  )}`

export const generateAuthorsMdast = (me) => ({
  type: 'paragraph',
  children: [
    {
      type: 'text',
      value: 'Von '
    },
    {
      type: 'link',
      title: null,
      url: me.id ? `/~${me.id}` : null,
      children: [
        {
          type: 'text',
          value: me?.name || 'Author'
        }
      ]
    },
    {
      type: 'text',
      value: `, ${pubDateFormat(new Date())}`
    }
  ]
})

