import type { MdastNode, SlateNode } from './NodeMapping'
const mapMdastToSlateNode = require('./NodeMapping')

function cleanSlateNode(slateNode: SlateNode): SlateNode {
  // Handle root
  if (Array.isArray(slateNode)) {
    return slateNode.filter(Boolean).map(cleanSlateNode)
  }

  if (
    slateNode instanceof Object &&
    'children' in slateNode &&
    Array.isArray(slateNode.children) &&
    slateNode.children.length > 0
  ) {
    const cleanedChildren = slateNode.children
      .filter(Boolean)
      .map(cleanSlateNode)

    return {
      ...slateNode,
      children: cleanedChildren,
    }
  }

  return slateNode
}

function convertMdastToSlate(mdastTree: MdastNode) {
  const slateTree = mapMdastToSlateNode(mdastTree)
  return cleanSlateNode(slateTree)
}

module.exports = convertMdastToSlate
