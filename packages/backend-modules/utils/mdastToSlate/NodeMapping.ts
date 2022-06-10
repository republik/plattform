// eslint-disable no-case-declarations, no-case-declarations
const flattenArray = require('./flattenArray')

export type MdastNode = {
  lang?: string
  meta?: string
  ordered?: boolean
  identifier?: string
  url?: string
  type: string
  children?: MdastNode[]
  value?: string
}

export type SlateNode =
  | {
      type?: string
      children?: SlateNode[]
      text?: string
      italic?: boolean
    }
  | object
  | SlateNode[]

function findDefinition(
  identifier: string,
  node: MdastNode,
): string | undefined {
  // Return the URL if the searched definition is found
  if (node.type === 'definition' && node.identifier) {
    return node.url
  }

  if (node?.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i += 1) {
      const definition = findDefinition(identifier, node.children[i])
      if (definition) {
        return definition
      }
    }
  }

  return undefined
}

function mapMdastToSlateNode(
  mdastNode: MdastNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  root?: MdastNode,
  parent?: MdastNode,
): SlateNode | SlateNode[] | undefined {
  const mappedChildren = mdastNode.children?.flatMap((node) =>
    mapMdastToSlateNode(node, root ?? mdastNode, mdastNode),
  )

  switch (mdastNode.type) {
    case 'root':
      return mappedChildren
    case 'paragraph':
      if (parent?.type === 'blockquote') {
        // Each nested text field must be rendered in a separate paragraph object

        return mappedChildren
          ?.filter(Boolean)
          .filter((node) => typeof node === 'object' && node?.type !== 'break')
          .map((child) => ({
            type: 'blockQuoteText',
            children: [child],
          }))
      }

      return {
        type: 'paragraph',
        children: mappedChildren,
      }
    case 'text':
      return {
        text: mdastNode.value,
      }
    case 'emphasis':
      return mappedChildren?.flatMap((node) => ({
        ...node,
        italic: true,
      }))
    case 'strong':
      return mappedChildren?.flatMap((node) => ({
        ...node,
        bold: true,
      }))
    case 'delete': // Strikethrough
      return mappedChildren?.flatMap((node) => ({
        ...node,
        strikethrough: true,
      }))
    case 'sup':
      return mappedChildren?.flatMap((node) => ({
        ...node,
        sup: true,
      }))
    case 'sub':
      return mappedChildren?.flatMap((node) => ({
        ...node,
        sub: true,
      }))
    case 'link':
      // eslint-disable-next-line no-case-declarations
      let url = mdastNode?.url
      if (url && !url.startsWith('http') && root) {
        url = findDefinition(url, root)
      }

      return {
        type: 'link',
        href: url,
        children: mappedChildren,
      }
    case 'definition':
      return undefined
    case 'thematicBreak': // Horizontal rule
      return undefined
    case 'blockquote':
      return {
        type: 'blockQuote',
        children: [
          ...flattenArray(mappedChildren),
          {
            children: [
              {
                text: '',
              },
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'figureByline',
              },
              {
                text: '',
              },
            ],
            type: 'figureCaption',
          },
        ],
      }
    case 'break':
      return {
        type: 'break',
        children: [
          {
            text: '',
          },
        ],
      }
    case 'heading':
      return {
        type: 'headline',
        children: mappedChildren,
      }
    case 'list':
      return {
        type: mdastNode?.ordered ? 'ol' : 'ul',
        ordered: !!mdastNode?.ordered,
        children: mappedChildren,
      }
    case 'listItem':
      // eslint-disable-next-line no-case-declarations
      const textNodes = mappedChildren?.flatMap((node) => {
        if (
          node instanceof Object &&
          'type' in node &&
          'children' in node &&
          node.type === 'paragraph'
        ) {
          return node.children
        }
        return node
      })
      return {
        type: 'listItem',
        children: textNodes,
      }
    case 'inlineCode':
      return {
        type: 'inlineCode',
        value: mdastNode.value,
      }
    case 'code':
      return {
        type: 'blockCode',
        value: mdastNode.value,
      }
    default:
      console.log(`Unhandled mdast node type: ${mdastNode.type}`)
      return undefined
  }
}

module.exports = mapMdastToSlateNode
