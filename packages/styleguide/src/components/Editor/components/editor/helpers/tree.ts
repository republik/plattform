import {
  CustomAncestor,
  CustomDescendant,
  CustomEditor,
  CustomElement,
  CustomNode,
  CustomText,
  NormalizeFn,
} from '../../../custom-types'
import {
  Text,
  Node,
  NodeEntry,
  Transforms,
  Editor,
  Element as SlateElement,
  BasePoint,
  Path,
  Range,
} from 'slate'
import { KeyboardEvent } from 'react'
import { selectPlaceholder } from './text'
import { config as elConfig } from '../../../config/elements'

const removeEmpty = (nodes: CustomDescendant[]): CustomDescendant[] =>
  nodes.filter((n) => {
    if (SlateElement.isElement(n)) {
      return Node.string(n) !== '' || elConfig[n.type].attrs?.isVoid
    } else {
      return !n.end
    }
  })

export const cleanupTree = (
  value: CustomDescendant[],
  noEmpty = false,
): CustomDescendant[] => {
  return value.map((node) => {
    if (SlateElement.isElement(node)) {
      const { template, children, ...rest } = node
      const childrenNoEmpty = noEmpty ? removeEmpty(children) : children
      return {
        children: cleanupTree(childrenNoEmpty, noEmpty),
        ...rest,
      }
    } else if (Text.isText(node)) {
      const { template, placeholder, end, ...rest } = node
      return rest
    }
  })
}

export const cleanupNode: (allowList: string[]) => NormalizeFn<CustomNode> =
  (allowList) =>
  ([node, path], editor) => {
    for (const prop in node) {
      if (!allowList.includes(prop)) {
        Transforms.unsetNodes(editor, prop, { at: path })
      }
    }
    // tree hasn't change
    return false
  }

const baseElementProps = ['type', 'children', 'template']
export const cleanupElement: NormalizeFn<CustomElement> = (
  [node, path],
  editor,
) => {
  const allowedProps = baseElementProps.concat(elConfig[node.type].props || [])
  return cleanupNode(allowedProps)([node, path], editor)
}

export const deleteExcessChildren: (
  from: number,
) => NormalizeFn<CustomAncestor> =
  (from) =>
  ([node, path], editor) => {
    if (node.children.length <= from) {
      return false
    }
    for (let i = node.children.length - 1; i >= from; i--) {
      Transforms.removeNodes(editor, { at: path.concat(i), voids: true })
    }
    return true
  }

export const cleanupVoids: NormalizeFn<CustomElement> = (
  [node, path],
  editor,
) => {
  if (!Editor.isVoid(editor, node)) return false
  if (Text.isText(node.children[0]) && node.children[0].text !== '') {
    Transforms.insertText(editor, '', { at: path.concat(0), voids: true })
  }
  return deleteExcessChildren(1)([node, path], editor)
}

export const getTextNode = (
  nodeEntry: NodeEntry,
  editor: CustomEditor,
  direction: 'next' | 'previous' = 'next',
): NodeEntry<CustomText> => {
  // console.log('GET TEXT NODE')
  const [node, path] = nodeEntry
  if (Text.isText(node) && !node.end) {
    // console.log('is text')
    return [node as CustomText, path]
  } else {
    // console.log('is block')
    let nearest: NodeEntry<CustomText>
    let distance = 100
    for (const [n, p] of Node.descendants(node)) {
      // console.log(n, p)
      // we want the shallowest child
      const newDistance = p.length
      if (
        Text.isText(n) &&
        !n.end &&
        (direction === 'next'
          ? newDistance <= distance
          : newDistance < distance)
      ) {
        distance = newDistance
        nearest = [n, p]
      }
    }
    if (!nearest && path !== []) {
      // console.log('couldnt find nearest')
      const parent = Editor.parent(editor, path)
      // console.log('trying parent node')
      return getTextNode(parent, editor, direction)
    }
    const nearestNode = nearest[0] as CustomText
    const nearestPath = path.concat(nearest[1])
    // console.log('found:', [nearestNode, nearestPath])
    return [nearestNode, nearestPath]
  }
}

export const findInsertTarget = (
  editor: CustomEditor,
  at?: Path,
): NodeEntry<CustomElement> | undefined => {
  // console.log('find repeat node')
  let target
  for (const [n, p] of Editor.nodes(editor, {
    match: SlateElement.isElement,
    at,
  })) {
    // console.log(n, p)
    if (n.template?.repeat && (!at || p.length <= at.length)) {
      target = [n, p]
    }
  }
  return target
}

export const selectText = (
  editor: CustomEditor,
  node: NodeEntry<CustomText>,
  direction: 'next' | 'previous' = 'next',
): void => {
  const [textNode, textPath] = node
  if (!textNode.text) {
    selectPlaceholder(editor, node)
    return
  }
  Transforms.select(editor, textPath)
  Transforms.collapse(editor, { edge: direction === 'next' ? 'start' : 'end' })
}

const isUnselectableVoid = (
  editor: CustomEditor,
  target: NodeEntry<CustomDescendant>,
): boolean =>
  Editor.isVoid(editor, target[0]) &&
  !elConfig[target[0].type].attrs?.highlightSelected

const isEnd = (target: NodeEntry<CustomDescendant>): boolean =>
  Text.isText(target[0]) && target[0].end

const isUnselectable = (
  editor: CustomEditor,
  target: NodeEntry<CustomDescendant>,
): boolean => isUnselectableVoid(editor, target) || isEnd(target)

export const getSiblingNode = (
  editor: CustomEditor,
  direction: 'next' | 'previous' = 'next',
  node?: NodeEntry<CustomDescendant>,
): NodeEntry<CustomDescendant> | undefined => {
  let currentNode = node
  if (!currentNode) {
    const getPath = direction === 'next' ? Range.end : Range.start
    const lowLevelPath = getPath(editor.selection).path
    currentNode = Editor.node(
      editor,
      lowLevelPath,
    ) as NodeEntry<CustomDescendant>
  }
  const edgeOfNode = Editor.edges(editor, currentNode[1])[
    direction === 'next' ? 1 : 0
  ]
  const findTarget = direction === 'next' ? Editor.next : Editor.previous
  let target = findTarget(editor, {
    at: edgeOfNode,
  })
  if (target && isUnselectable(editor, target)) {
    target = getSiblingNode(editor, direction, target)
  }
  return target
}

export const overlaps = (path1: number[], path2: number[]): boolean =>
  path1.every((p, i) => p === path2[i])

export const isDescendant = (
  parent: NodeEntry<CustomDescendant>,
  child: NodeEntry<CustomDescendant>,
): boolean => overlaps(parent[1], child[1])

export const calculateSiblingPath = (
  path: number[],
  direction: 'next' | 'previous' = 'next',
  by?: number,
): number[] => {
  if (by === 0) return path
  const offset = by || (direction === 'next' ? 1 : -1)
  return path.map((p, i) => (i === path.length - 1 ? p + offset : p))
}

const getSiblingTextNode = (
  editor: CustomEditor,
  direction: 'next' | 'previous' = 'next',
): NodeEntry<CustomText> => {
  const node = getSiblingNode(editor, direction)
  if (node) {
    return getTextNode(node, editor, direction)
  }
}

const getCommonNode = (editor: CustomEditor): NodeEntry =>
  Node.common(editor, editor.selection.anchor.path, editor.selection.focus.path)

export const getParent = (
  editor: CustomEditor,
  node: NodeEntry<Node>,
): NodeEntry<CustomElement> | undefined => {
  const parent = Editor.parent(editor, node[1])
  if (SlateElement.isElement(parent[0])) {
    return parent as NodeEntry<CustomElement>
  }
}

export const spansManyElements = (editor: CustomEditor): boolean =>
  Node.fragment(editor, editor.selection).length > 1

export const getAncestry = (
  editor: CustomEditor,
  customNode?: NodeEntry<CustomNode>,
): {
  text?: NodeEntry<CustomText>
  element?: NodeEntry<CustomElement>
  container?: NodeEntry<CustomElement>
  topLevelContainer?: NodeEntry<CustomElement>
} => {
  const common = customNode || getCommonNode(editor)
  let text: NodeEntry<CustomText>
  let element: NodeEntry<CustomElement>
  let container: NodeEntry<CustomElement>
  let topLevelContainer: NodeEntry<CustomElement>
  if (Text.isText(common[0])) {
    text = common as NodeEntry<CustomText>
    element = getParent(editor, common)
  } else if (SlateElement.isElement(common[0])) {
    element = common as NodeEntry<CustomElement>
  } else {
    return {}
  }

  if (elConfig[element[0].type].attrs?.isMain) {
    container = element
  }
  while (container && elConfig[container[0].type].attrs?.isMain) {
    container = getParent(editor, container)
  }

  for (const [n, p] of Node.ancestors(editor, element[1], { reverse: true })) {
    if (SlateElement.isElement(n)) {
      topLevelContainer = [n as CustomElement, p]
    }
  }

  return {
    text,
    element,
    container,
    topLevelContainer,
  }
}

export const getSelectedElement = (
  editor: CustomEditor,
): NodeEntry<CustomElement> => {
  let selectedNode = Editor.node(editor, editor.selection, { edge: 'end' })
  while (!SlateElement.isElement(selectedNode[0])) {
    selectedNode = Editor.parent(editor, selectedNode[1])
  }
  return selectedNode as NodeEntry<CustomElement>
}

export const hasNextSibling = (
  editor: CustomEditor,
  isInline = false,
): boolean => {
  const currentPath = Range.end(editor.selection).path
  const nextNode = getSiblingTextNode(editor)
  if (!nextNode) return
  const nextPath = nextNode[1]
  const depth = isInline ? currentPath.length - 1 : currentPath.length - 2
  // console.log('has next sibling?', { currentPath, nextPath })
  return currentPath.every((p, i) => i >= depth || p === nextPath[i])
}

export const selectNode = (
  editor: CustomEditor,
  target: BasePoint | Path,
  direction: 'next' | 'previous' = 'next',
): void => {
  const [targetNode, targetPath] = Editor.node(editor, target)
  const text = getTextNode([targetNode, targetPath], editor, direction)
  selectText(editor, text, direction)
}

// BUG: from figureCaption, doesnt jump to figureByline if it's empty
export const selectAdjacent = (
  editor: CustomEditor,
  direction: 'next' | 'previous' = 'next',
): void => {
  const node = getSiblingNode(editor, direction)
  if (node) {
    selectNode(editor, node[1], direction)
  }
}

export const navigateOnTab = (
  editor: CustomEditor,
  event: KeyboardEvent<HTMLDivElement>,
): void => {
  if (event.key === 'Tab') {
    event.preventDefault()
    selectAdjacent(editor, event.shiftKey ? 'previous' : 'next')
  }
}
