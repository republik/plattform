// eslint-disable no-case-declarations, no-case-declarations
const flattenArray = require('./flattenArray')

export type MdastNode = {
  label?: string
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
      value?: boolean
      italic?: boolean
      href?: string
    }
  | {
      [key: string]: any
    }

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

type Context = {
  italic?: boolean
  bold?: boolean
  strikethrough?: boolean
  sup?: boolean
  sub?: boolean
}

function mapMdastToSlateNode(
  mdastNode: MdastNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  root?: MdastNode,
  parent?: MdastNode,
  context?: Context,
): SlateNode | SlateNode[] | undefined {
  const convertChildren = (
    children: MdastNode[] = [],
    newContext: Context | undefined = context,
  ): SlateNode[] | undefined => {
    return children?.flatMap((node) =>
      mapMdastToSlateNode(node, root ?? mdastNode, mdastNode, newContext),
    )
  }

  if (mdastNode.type === 'root') {
    return convertChildren(mdastNode.children)
  } else if (mdastNode.type === 'paragraph') {
    if (parent?.type === 'blockquote') {
      // Each nested text field must be rendered in a separate paragraph object

      return convertChildren(mdastNode.children)
        ?.filter(Boolean)
        .filter(
          // Filter breakpoints
          (node) =>
            typeof node === 'object' &&
            (!('type' in node) || node?.type !== 'break'),
        )
        .map((child) => ({
          type: 'blockQuoteText',
          children: [child],
        }))
    }

    return {
      type: 'paragraph',
      children: convertChildren(mdastNode.children),
    }
  } else if (mdastNode.type === 'text') {
    const textObject = {
      text: mdastNode.value,
    }
    if (context?.italic) Object.assign(textObject, { italic: true })
    if (context?.bold) Object.assign(textObject, { bold: true })
    if (context?.strikethrough)
      Object.assign(textObject, { strikethrough: true })
    if (context?.sup) Object.assign(textObject, { sup: true })
    if (context?.sub) Object.assign(textObject, { sub: true })
    return textObject
  } else if (mdastNode.type === 'emphasis') {
    return convertChildren(mdastNode.children, { italic: true })
  } else if (mdastNode.type === 'strong') {
    return convertChildren(mdastNode.children, { bold: true })
  } else if (mdastNode.type === 'delete') {
    // Strikethrough
    return convertChildren(mdastNode.children, { strikethrough: true })
  } else if (mdastNode.type === 'sup') {
    return convertChildren(mdastNode.children, { sup: true })
  } else if (mdastNode.type === 'sub') {
    return convertChildren(mdastNode.children, { sub: true })
  } else if (mdastNode.type === 'link') {
    // eslint-disable-next-line no-case-declarations
    let url = mdastNode?.url
    if (url && !url.startsWith('http') && root) {
      url = findDefinition(url, root)
    }

    return {
      type: 'link',
      href: url,
      children: convertChildren(mdastNode.children),
    }
  } else if (mdastNode.type === 'linkReference') {
    const children = convertChildren(mdastNode.children)
    // eslint-disable-next-line no-case-declarations
    const nestedText =
      children && Array.isArray(children) && children.length > 0
        ? (children[0] as SlateNode)
        : undefined

    return {
      text: `[${
        nestedText?.text ?? mdastNode?.label ?? mdastNode?.identifier
      }]`,
    }
  } else if (mdastNode.type === 'definition') {
    // Not supported
    return undefined
  } else if (mdastNode.type === 'thematicBreak') {
    // Horizontal rule
    return undefined
  } else if (mdastNode.type === 'blockquote') {
    const children = convertChildren(mdastNode.children)
    // Handle nested blockquotes and return them inline as a new paragraph
    if (parent && parent?.type === 'blockquote') {
      return children
    }

    return {
      type: 'blockQuote',
      children: flattenArray(children),
    }
  } else if (mdastNode.type === 'break') {
    return {
      type: 'break',
      children: [
        {
          text: '',
        },
      ],
    }
  } else if (mdastNode.type === 'heading') {
    return {
      type: 'headline',
      children: convertChildren(mdastNode.children),
    }
  } else if (mdastNode.type === 'list') {
    return {
      type: mdastNode?.ordered ? 'ol' : 'ul',
      ordered: !!mdastNode?.ordered,
      children: convertChildren(mdastNode.children),
    }
  } else if (mdastNode.type === 'listItem') {
    // eslint-disable-next-line no-case-declarations
    const textNodes = convertChildren(mdastNode.children)?.flatMap((node) => {
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
  } else if (mdastNode.type === 'inlineCode') {
    return {
      type: 'inlineCode',
      value: mdastNode.value,
    }
  } else if (mdastNode.type === 'code') {
    return {
      type: 'blockCode',
      value: mdastNode.value,
    }
  } else if (mdastNode.type === 'html') {
    return {
      text: mdastNode.value,
    }
  } else if (mdastNode.type === 'image') {
    // not supported
    return undefined
  } else {
    console.log(`Unhandled mdast node type: ${mdastNode.type}`)
    return undefined
  }
}

module.exports = mapMdastToSlateNode
