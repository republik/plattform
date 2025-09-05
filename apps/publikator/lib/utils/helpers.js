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

const pubDateFormat = swissTime.format('%d.%m.%Y')

export const generateAuthorsLine = (me) => ({
  type: 'paragraph',
  children: [
    {
      type: 'text',
      value: 'Von ',
    },
    {
      type: 'link',
      title: null,
      url: me ? `/~${me.id})` : '',
      children: [
        {
          type: 'text',
          value: me ? me.name : 'Autor',
        },
      ],
    },
    {
      type: 'text',
      value: `, ${pubDateFormat(new Date())}`,
    },
  ],
})
