import {
  CustomAncestor,
  CustomDescendant,
  CustomEditor,
  CustomElement,
  CustomNode,
  CustomText,
  NormalizeFn,
} from '../../custom-types'
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
import { selectEmptyTextNode, isEmpty } from './text'
import { config as elConfig } from '../../config/elements'
import { getId } from './utils'

export const NAV_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ArrowUp',
  'Tab',
]

const hasFilledProps = (element: CustomElement): boolean => {
  const props = elConfig[element.type]?.props
  return props.some((p) => !!element[p])
}

const keepVoid = (element: CustomElement): boolean => {
  const config = elConfig[element.type]
  return (
    config?.attrs?.neverDelete ||
    !config?.props?.length ||
    hasFilledProps(element)
  )
}

const keepNonVoid = (element: CustomElement): boolean =>
  element.children.some(
    (child) => SlateElement.isElement(child) || !isEmpty(child.text),
  )

const removeEmptyNodes = (n: CustomDescendant): boolean => {
  if (SlateElement.isElement(n)) {
    return elConfig[n.type].attrs?.isVoid ? keepVoid(n) : keepNonVoid(n)
  } else {
    return !n.end
  }
}

export const cleanupTree = (
  value: CustomDescendant[],
  noEmpty = false,
): CustomDescendant[] => {
  const emptyFilter = noEmpty ? removeEmptyNodes : Boolean
  return value
    .map((node) => {
      if (SlateElement.isElement(node)) {
        const { template, children, ...rest } = node
        const childrenNoEmpty = children.filter(emptyFilter)
        return {
          children: cleanupTree(childrenNoEmpty, noEmpty),
          ...rest,
        }
      } else if (Text.isText(node)) {
        const { template, placeholder, end, ...rest } = node
        return rest
      }
    })
    .filter(emptyFilter)
}

export const cleanupNode: (allowList: string[]) => NormalizeFn<CustomNode> =
  (allowList) =>
  ([node, path], editor) => {
    for (const prop in node) {
      if (!allowList.includes(prop)) {
        Transforms.unsetNodes(editor, prop, { at: path })
      }
    }
    // tree hasn't changed
    return false
  }

const baseElementProps = ['type', 'children', 'template']
export const cleanupElement: NormalizeFn<CustomElement> = (
  [node, path],
  editor,
) => {
  const voidProps = elConfig[node.type].attrs?.isVoid ? ['voidId'] : []
  const allowedProps = baseElementProps
    .concat(voidProps)
    .concat(elConfig[node.type].props || [])
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
    if (!nearest && path.length > 0) {
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

export const findRepeatableNode = (
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
    selectEmptyTextNode(editor, node)
    return
  }
  Transforms.select(editor, textPath)
  Transforms.collapse(editor, { edge: direction === 'next' ? 'start' : 'end' })
}

export const isUnselectableVoid = (
  editor: CustomEditor,
  target: NodeEntry<CustomDescendant>,
): boolean =>
  Editor.isVoid(editor, target[0]) && !elConfig[target[0].type]?.Form

const isEnd = (target: NodeEntry<CustomDescendant>): boolean =>
  Text.isText(target[0]) && target[0].end

const isUnselectable = (
  editor: CustomEditor,
  target: NodeEntry<CustomDescendant>,
): boolean => isUnselectableVoid(editor, target) || isEnd(target)

export const getAdjacentNode = (
  editor: CustomEditor,
  direction: 'next' | 'previous' = 'next',
  node?: NodeEntry<CustomDescendant>,
): NodeEntry<CustomDescendant> | undefined => {
  let currentNode = node
  if (!currentNode) {
    const getPoint = direction === 'next' ? Range.end : Range.start
    const lowLevelPath = editor.selection && getPoint(editor.selection).path
    if (!lowLevelPath) return

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
    target = getAdjacentNode(editor, direction, target)
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
  const node = getAdjacentNode(editor, direction)
  if (node) {
    return getTextNode(node, editor, direction)
  }
}

export const getParent = (
  editor: CustomEditor,
  node: NodeEntry,
): NodeEntry<CustomElement> | undefined => {
  const parent = Editor.parent(editor, node[1])
  if (SlateElement.isElement(parent[0])) {
    return parent as NodeEntry<CustomElement>
  }
}

export const spansManyElements = (editor: CustomEditor): boolean =>
  Node.fragment(editor, editor.selection).length > 1

export const isEntireNodeSelected = (
  node: NodeEntry<CustomText>,
  selection: Range,
): boolean => {
  const nodeP = node[1]
  const offset = node[0].text.length
  const start = Range.start(selection)
  const end = Range.end(selection)
  return (
    Path.equals(start.path, nodeP) &&
    Path.equals(end.path, nodeP) &&
    start.offset === 0 &&
    end.offset === offset
  )
}

const hasConvertChoices = (element: CustomElement) => {
  const templateTypes = element?.template?.type
  return (
    Array.isArray(templateTypes) &&
    templateTypes.length > 1 &&
    !elConfig[element.type].attrs?.isInline
  )
}

export const getAncestry = (
  editor: CustomEditor,
  customNode?: NodeEntry<CustomNode>,
): {
  text?: NodeEntry<CustomText>
  element?: NodeEntry<CustomElement>
  moreElements?: NodeEntry<CustomElement>[]
  container?: NodeEntry<CustomElement>
  convertContainer?: NodeEntry<CustomElement>
} => {
  const first = customNode || Editor.first(editor, editor.selection)
  const last = customNode || Editor.last(editor, editor.selection)
  const firstParent = getParent(editor, first)
  const lastParent = getParent(editor, last)
  let text: NodeEntry<CustomText>
  let element: NodeEntry<CustomElement>
  const moreElements: NodeEntry<CustomElement>[] = []
  let container: NodeEntry<CustomElement>
  let convertContainer: NodeEntry<CustomElement>
  if (
    Text.isText(first[0]) &&
    Text.isText(last[0]) &&
    Path.equals(firstParent[1], lastParent[1])
  ) {
    text = first as NodeEntry<CustomText>
    element = firstParent
  } else if (
    SlateElement.isElement(first[0]) &&
    Path.equals(first[1], last[1])
  ) {
    element = first as NodeEntry<CustomElement>
  } else {
    return {}
  }

  if (element[0].template.main) {
    container = element
  }
  while (container && container[0].template.main) {
    container = getParent(editor, container)
  }

  // for the convert options in the toolbar
  if (!hasConvertChoices(element[0])) {
    for (const [n, p] of Node.ancestors(editor, element[1], {
      reverse: true,
    })) {
      if (SlateElement.isElement(n)) {
        if (hasConvertChoices(n)) {
          convertContainer = [n as CustomElement, p]
          break
        }
        moreElements.push([n, p])
      }
    }
  }

  return {
    text,
    element,
    moreElements,
    container,
    convertContainer,
  }
}

export const isTextInline = (element: CustomElement): boolean =>
  elConfig[element.type].attrs?.isInline &&
  !elConfig[element.type].attrs?.isInlineBlock

export const getSelectedElement = (
  editor: CustomEditor,
  noTextInlines = false,
): NodeEntry<CustomElement> => {
  let selectedNode = Editor.node(editor, editor.selection, { edge: 'end' })
  while (
    !SlateElement.isElement(selectedNode[0]) ||
    (noTextInlines && isTextInline(selectedNode[0]))
  ) {
    selectedNode = Editor.parent(editor, selectedNode[1])
  }
  return selectedNode as NodeEntry<CustomElement>
}

export const isFirstSibling = (node: NodeEntry<CustomNode>): boolean =>
  node[1].slice(-1)[0] === 0

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

// this is a workaround:
// slate seems to have trouble to select completely void nodes
// so we temporarily set an ID and revert it
const selectVoid = (
  editor: CustomEditor,
  node: NodeEntry<CustomElement>,
): void => {
  Transforms.setNodes(editor, { voidId: getId() }, { at: node[1] })
  Transforms.select(editor, node[1])
  Transforms.unsetNodes(editor, 'voidId', { at: node[1] })
}

export const selectNode = (
  editor: CustomEditor,
  target: BasePoint | Path,
  direction: 'next' | 'previous' = 'next',
): void => {
  const [targetNode, targetPath] = Editor.node(editor, target)
  if (
    SlateElement.isElement(targetNode) &&
    elConfig[targetNode.type].attrs?.isVoid
  ) {
    return selectVoid(editor, [targetNode, targetPath])
  }
  const text = getTextNode([targetNode, targetPath], editor, direction)
  selectText(editor, text, direction)
}

// BUG: from figureCaption, doesnt jump to figureByline if it's empty
export const selectAdjacent = (
  editor: CustomEditor,
  direction: 'next' | 'previous' = 'next',
): void => {
  const node = getAdjacentNode(editor, direction)
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
