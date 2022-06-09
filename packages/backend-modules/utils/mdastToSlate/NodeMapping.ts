// eslint-disable no-case-declarations, no-case-declarations, prefer-const

export type MdastNode = {
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

function mapMdastToSlateNode(
  mdastNode: MdastNode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent?: MdastNode,
): SlateNode | SlateNode[] | undefined {
  const mappedChildren = mdastNode.children?.flatMap((node) =>
    mapMdastToSlateNode(node, mdastNode),
  )

  switch (mdastNode.type) {
    case 'root':
      return mappedChildren
    case 'paragraph':
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
    case 'link':
      return {
        type: 'link',
        href: mdastNode.url,
        children: mappedChildren,
      }
    default:
      console.warn(
        `Unhandled mdast node type: ${mdastNode.type} \n (${JSON.stringify(
          mdastNode,
        )})`,
      )
      return {}
  }
}

module.exports = mapMdastToSlateNode
