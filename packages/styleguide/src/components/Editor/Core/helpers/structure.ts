import { KeyboardEvent } from 'react'
import {
  CustomAncestor,
  CustomDescendant,
  CustomEditor,
  CustomElement,
  CustomElementsType,
  CustomNode,
  CustomText,
  ElementConfigI,
  KeyCombo,
  NodeTemplate,
  NormalizeFn,
  TemplateType,
} from '../../custom-types'
import {
  Editor,
  Element as SlateElement,
  Text,
  Transforms,
  Range,
  Node,
  NodeEntry,
  Path,
} from 'slate'
import {
  calculateSiblingPath,
  deleteExcessChildren,
  findRepeatableNode,
  getAncestry,
  getParent,
  getSelectedElement,
  getAdjacentNode,
  hasNextSibling,
  isDescendant,
  isEntireNodeSelected,
  selectAdjacent,
  spansManyElements,
  isFirstSibling,
} from './tree'
import { config as elConfig } from '../../config/elements'
import { getCharCount, selectNearestWord } from './text'

const DEFAULT_STRUCTURE: NodeTemplate[] = [{ type: ['text'], repeat: true }]
export const TEXT = { text: '' }

export const isAllowedType = (
  elType: TemplateType,
  allowedTypes: TemplateType | TemplateType[],
): boolean =>
  Array.isArray(allowedTypes)
    ? allowedTypes.some((t) => t === elType)
    : allowedTypes === elType

export const isCorrect = (
  node: CustomDescendant | undefined,
  template: NodeTemplate | undefined,
  approximate?: boolean,
): boolean => {
  if (!node && !template) return true
  if (!node || !template) return false
  const elType =
    Text.isText(node) ||
    (approximate &&
      SlateElement.isElement(node) &&
      elConfig[node.type].attrs.isInline)
      ? 'text'
      : node.type
  return (
    isAllowedType(elType, template.type) &&
    (!Text.isText(node) || node.end === template.end)
  )
}

export const getTemplateType = (
  template?: NodeTemplate,
): CustomElementsType | undefined => {
  if (!template) return
  const nodeType = Array.isArray(template.type)
    ? template.type[0]
    : template.type
  return nodeType !== 'text' && nodeType !== 'inherit' ? nodeType : undefined
}

const buildTextNode = (isEnd: boolean): CustomText => {
  const end = isEnd ? { end: true } : {}
  return {
    ...TEXT,
    ...end,
  }
}

const getDefaultProps = (config: ElementConfigI): any => {
  const props = {}
  if (!config?.defaultProps) return props
  Object.keys(config.defaultProps).forEach((key) => {
    const value = config.defaultProps[key]
    props[key] = typeof value === 'function' ? value() : value
  })
  return props
}

const buildElement = (elKey: CustomElementsType): CustomElement => {
  const config = elConfig[elKey]
  const isVoid = config.attrs?.isVoid
  const defaultProps = getDefaultProps(config)
  return {
    type: elKey,
    children: isVoid ? [TEXT] : [],
    ...defaultProps,
  }
}

const buildFromTemplate = (template: NodeTemplate): CustomDescendant => {
  const nodeType = getTemplateType(template)
  return !nodeType ? buildTextNode(template.end) : buildElement(nodeType)
}

const shouldRemove = (
  currentNode: CustomDescendant | undefined,
  nextNode: CustomDescendant | undefined,
  currentTemplate: NodeTemplate | undefined,
  prevTemplate: NodeTemplate | undefined,
): boolean =>
  currentNode &&
  !isCorrect(currentNode, currentTemplate) &&
  (isCorrect(nextNode, currentTemplate) ||
    (prevTemplate?.repeat && isCorrect(nextNode, prevTemplate)))

const getMainElement = (
  structure?: NodeTemplate[],
): CustomElementsType | undefined => {
  const main = structure?.find((template) => template.main)
  if (!main) return
  return getTemplateType(main)
}

const getMaxChildren = (config: ElementConfigI): number => {
  const structure = config.structure
  if (!structure) return
  if (structure.some((nt) => nt.repeat)) return
  return structure.length
}

const setChildren = (
  editor: CustomEditor,
  node: NodeEntry<CustomElement>,
  props: Partial<Node>,
  match?: (node: CustomNode) => boolean,
): number => {
  let updatedChildren = 0
  for (let i = 0; i < node[0].children.length; i++) {
    if (!match || match(node[0].children[i])) {
      Transforms.setNodes(editor, props, { at: node[1].concat(i) })
      updatedChildren++
    }
  }
  return updatedChildren
}

const toggleInline = (
  editor: CustomEditor,
  element: CustomElement,
): number[] | undefined => {
  const { selection } = editor
  if (!selection) return
  const {
    text: target,
    element: parent,
    moreElements: otherAncestors,
  } = getAncestry(editor)
  const potentialAncestors = [parent, ...otherAncestors]
  const matchingAncestor = potentialAncestors.find(
    (node) => node[0].type === element.type,
  )
  if (matchingAncestor) {
    Transforms.unwrapNodes(editor, { at: matchingAncestor[1], voids: true })
    return
  }
  const allowedTemplates = target[0].template
  if (
    !target ||
    !allowedTemplates ||
    !isAllowedType(element.type, allowedTemplates.type)
  ) {
    return
  }
  const isCollapsed = Range.isCollapsed(selection)
  if (isCollapsed && elConfig[element.type].attrs?.isVoid) {
    Transforms.insertNodes(editor, element)
  } else if (isCollapsed) {
    const retry = selectNearestWord(editor)
    return retry ? toggleInline(editor, element) : undefined
  } else {
    Transforms.wrapNodes(editor, element, { split: true })
  }
  // if the node is the first inline sibling,
  // after wrapping the inline element around it,
  // slate will automatically insert an empty text node before
  return isEntireNodeSelected(target, selection) && !isFirstSibling(target)
    ? target[1]
    : calculateSiblingPath(target[1])
}

const convertBlock = (
  editor: CustomEditor,
  element: CustomElement,
  customTarget?: NodeEntry<CustomElement>,
): number[] => {
  let target
  if (customTarget) {
    target = customTarget
  } else {
    const { element: targetE, convertContainer: targetC } = getAncestry(editor)
    target = targetC || targetE
  }

  const targetConfig = elConfig[target[0].type]
  const insertConfig = elConfig[element.type]
  const insertProps = getDefaultProps(insertConfig)
  const insertPartial = {
    type: element.type,
    ...insertProps,
  }

  const mainElKey = getMainElement(insertConfig.structure)
  const mainElProps = getDefaultProps(elConfig[mainElKey])
  const mainElPartial = mainElKey && {
    type: mainElKey,
    ...mainElProps,
  }
  const targetMainElKey = getMainElement(targetConfig.structure)

  let insertPath = target[1]
  const getMainEls = (n) =>
    SlateElement.isElement(n) && n.type === targetMainElKey

  // TODO: insert path when mainElKey doesn't allow for repeats (no use case atm)
  Editor.withoutNormalizing(editor, () => {
    // console.log({ target, targetMainElKey, mainElKey })
    if (targetMainElKey && mainElKey) {
      Transforms.setNodes(editor, insertPartial, { at: target[1] })
      const updatedChildren = setChildren(
        editor,
        target,
        mainElPartial,
        getMainEls,
      )
      const childrenCount = getMaxChildren(insertConfig) || updatedChildren
      insertPath = target[1].concat(childrenCount - 1)
    } else if (targetMainElKey) {
      const updatedChildren = setChildren(
        editor,
        target,
        insertPartial,
        getMainEls,
      )
      Transforms.unwrapNodes(editor, { at: target[1] })
      insertPath = calculateSiblingPath(target[1], 'next', updatedChildren - 1)
    } else if (mainElKey) {
      insertPath = target[1].concat(0)
      Transforms.setNodes(editor, mainElPartial, { at: target[1] })
      Transforms.wrapNodes(editor, element, { at: target[1] })
    } else {
      Transforms.setNodes(editor, insertPartial, { at: target[1] })
    }
  })
  return insertPath
}

export const toggleElement = (
  editor: CustomEditor,
  elKey: CustomElementsType,
): number[] => {
  // console.log('toggle', elKey)

  const { selection } = editor
  if (!selection) return

  const config = elConfig[elKey]
  const element = buildElement(elKey)

  let elementPath: number[]

  const isInline = config.attrs?.isInline
  if (isInline) {
    elementPath = toggleInline(editor, element)
  } else {
    elementPath = convertBlock(editor, element)
  }

  if (elementPath) {
    Transforms.select(editor, elementPath)
    Transforms.collapse(editor, { edge: 'end' })
  }

  // handle unselectable elements (e.g. break)
  if (config.attrs?.isVoid && !config?.Form) {
    selectAdjacent(editor)
    return editor.selection.anchor.path
  }

  return elementPath
}

const fixNode = (
  node: CustomDescendant | undefined,
  path: number[],
  currentTemplate: NodeTemplate,
  nextTemplates: NodeTemplate[] | undefined,
  editor: CustomEditor,
): void => {
  const newNode = buildFromTemplate(currentTemplate)
  // console.log('FIX NODE', { node, path, currentTemplate, newNode })

  if (
    !node ||
    (nextTemplates?.length && nextTemplates.some((t) => isCorrect(node, t)))
  ) {
    // console.log('insert node')
    return Transforms.insertNodes(editor, newNode, {
      at: path,
    })
  }

  if (SlateElement.isElement(node) && SlateElement.isElement(newNode)) {
    // console.log('convert node')
    convertBlock(editor, newNode, [node, path])
    return
  }

  if (Text.isText(node) && SlateElement.isElement(newNode)) {
    // console.log('wrap node')
    return Transforms.wrapNodes(editor, newNode, { at: path })
  }

  if (Text.isText(newNode)) {
    // console.log('set text')
    newNode.text = Node.string(node)
  }

  Transforms.removeNodes(editor, { at: path })
  Transforms.insertNodes(editor, newNode, { at: path })
}

// we probably don't need to relink every time
const linkTemplate = (
  path: number[],
  template: NodeTemplate,
  editor: CustomEditor,
): void => {
  const newProperties: Partial<CustomElement> = {
    template,
  }
  Transforms.setNodes(editor, newProperties, { at: path })
}

const deleteParent = (
  editor: CustomEditor,
  currentTemplate: NodeTemplate,
): boolean => {
  // console.log('DELETE PARENT')
  const elementType = getTemplateType(currentTemplate)
  const lastOp = editor.operations[editor.operations.length - 1]
  return (
    elementType &&
    lastOp &&
    lastOp.type === 'remove_node' &&
    SlateElement.isElement(lastOp.node) &&
    lastOp.node.type === elementType &&
    currentTemplate.main
  )
}

const removeNode = (
  editor: CustomEditor,
  currentNode: CustomNode,
  currentPath: number[],
): void => {
  if (
    SlateElement.isElement(currentNode) &&
    Editor.isInline(editor, currentNode) &&
    !Editor.isVoid(editor, currentNode)
  ) {
    return Transforms.unwrapNodes(editor, { at: currentPath })
  }
  Transforms.removeNodes(editor, { at: currentPath })
}

// Handles the 'inherit' structure type
const getStructure = (
  editor: CustomEditor,
  node: NodeEntry<CustomAncestor>,
  inputStructure: NodeTemplate[],
): NodeTemplate[] => {
  if (!SlateElement.isElement(node[0]) || inputStructure[0].type !== 'inherit')
    return inputStructure
  const parent = Editor.parent(editor, node[1])
  if (!SlateElement.isElement(parent[0])) return inputStructure
  const parentStructure = elConfig[parent[0].type].structure
  // This is a fallback when the parent is a complex structure (e.g. figure caption)
  if (parentStructure.length > 1)
    return [
      parentStructure.find((t) => isAllowedType('text', t.type) && !t.end),
    ]
  return getStructure(editor, parent, parentStructure)
}

export const fixStructure: (
  inputStructure?: NodeTemplate[],
) => NormalizeFn<CustomAncestor> =
  (inputStructure = DEFAULT_STRUCTURE) =>
  ([node, path], editor) => {
    const structure = getStructure(editor, [node, path], inputStructure)
    // console.log({ value: editor.children })
    let i = 0
    let repeatOffset = 0
    let loop = true
    while (loop) {
      const currentNode = node.children[i + repeatOffset]
      const nextNode =
        i + repeatOffset < node.children.length - 1 &&
        node.children[i + repeatOffset + 1]
      const currentPath = path.concat(i + repeatOffset)
      const currentTemplate = structure[i]
      const prevTemplate = i > 0 && structure[i - 1]
      const nextTemplate = i < structure.length - 1 && structure[i + 1]
      const nextTemplates = nextTemplate && structure.slice(i + 1)
      /* console.log({
        i,
        repeatOffset,
        currentNode,
        nextNode,
        currentTemplate,
        prevTemplate,
        nextTemplate,
      }) */
      if (prevTemplate?.repeat && isCorrect(currentNode, prevTemplate)) {
        // we use the template for switch between block types and onEnter insert
        linkTemplate(currentPath, prevTemplate, editor)
        repeatOffset += 1
      } else if (
        shouldRemove(currentNode, nextNode, currentTemplate, prevTemplate)
      ) {
        removeNode(editor, currentNode, currentPath)
        return true
      } else if (!currentTemplate) {
        loop = false
      } else if (isCorrect(currentNode, currentTemplate)) {
        linkTemplate(currentPath, currentTemplate, editor)
        i += 1
      } else if (deleteParent(editor, currentTemplate)) {
        Transforms.removeNodes(editor, { at: path })
        return true
      } else {
        fixNode(
          currentNode,
          currentPath,
          currentTemplate,
          nextTemplates,
          editor,
        )
        return true
      }
    }
    return deleteExcessChildren(structure.length + repeatOffset)(
      [node, path],
      editor,
    )
  }

export const insertOnKey =
  (keyCombo: KeyCombo, elKey: CustomElementsType) =>
  (editor: CustomEditor, event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === keyCombo.name && event.shiftKey === !!keyCombo.shift) {
      event.preventDefault()
      toggleElement(editor, elKey)
    }
  }

const getNode = (editor: CustomEditor, potentialPath): CustomNode | boolean =>
  Path.isPath(potentialPath) &&
  Node.has(editor, potentialPath) &&
  Editor.node(editor, potentialPath)[0]

export const moveElement = (
  editor: CustomEditor,
  elPath: number[],
  direction: 'up' | 'down',
  dryRun?: boolean,
): boolean => {
  const siblingPath = calculateSiblingPath(
    elPath,
    direction === 'up' ? 'previous' : 'next',
  )
  const siblingEl = getNode(editor, siblingPath)
  if (!siblingEl || !SlateElement.isElement(siblingEl)) return
  const element = getNode(editor, elPath)
  const elTemplate = SlateElement.isElement(element) && element.template
  // if the template doesn't allow for repeat, moving the element up/down
  // would be erased by the normaliser
  if (!elTemplate || !elTemplate.repeat) return
  if (!isAllowedType(siblingEl.type, elTemplate.type)) return
  if (dryRun) return true
  Transforms.moveNodes(editor, { at: elPath, to: siblingPath })
  return true
}

export const removeElement = (
  editor: CustomEditor,
  elPath: number[],
  dryRun?: boolean,
): boolean => {
  const canRemove =
    moveElement(editor, elPath, 'up', true) ||
    moveElement(editor, elPath, 'down', true)
  if (!canRemove) return
  if (dryRun) return true
  Transforms.removeNodes(editor, { at: elPath })
  return true
}

export const insertElement = (
  editor: CustomEditor,
  elKey: CustomElementsType | TemplateType,
  elPath: number[],
  direction: 'before' | 'after' = 'after',
): number[] => {
  const element = buildElement(elKey as CustomElementsType)
  const insertPath =
    direction === 'after' ? calculateSiblingPath(elPath) : elPath
  Transforms.insertNodes(editor, element, { at: insertPath })
  Transforms.select(editor, insertPath)
  Transforms.collapse(editor, { edge: 'start' })
  return insertPath
}

const deleteOnInsert = (
  editor: CustomEditor,
  target: NodeEntry<CustomElement>,
  selected: NodeEntry<CustomElement>,
): number[] | undefined => {
  // TODO: isEmpty -> take into account voids with filled props edge case
  if (!target) return
  if (getCharCount([target[0]]) !== 0) return
  if (!removeElement(editor, target[1], true)) return
  const siblingPath = calculateSiblingPath(selected[1])
  const nextOfType = getNode(editor, siblingPath)
  const hasSibling =
    SlateElement.isElement(nextOfType) && nextOfType.type === target[0].type
  const targetParent = getParent(editor, target)
  if (!hasSibling && targetParent) {
    return target[1]
  }
}

export const setToType = (
  editor: CustomEditor,
  nodeProps: Partial<CustomElement>,
  insertType: CustomElementsType,
  insertAt: number[],
) => {
  const insertPartial = {
    type: insertType,
    ...nodeProps,
  }
  Transforms.setNodes(editor, insertPartial, { at: insertAt })
}

const splitAndInsert = (
  editor: CustomEditor,
  target: NodeEntry<CustomElement>,
  inPlace: boolean,
  cleanupFn: () => void,
) => {
  Editor.withoutNormalizing(editor, () => {
    // split nodes at selection and move the second half of the split
    // in the first position where repeats are allowed
    const [targetN, targetP] = target
    Transforms.splitNodes(editor, { always: true })
    // since the node got split, splitP != selectionP
    const splitP = getSelectedElement(editor, true)[1]
    const insertType = getTemplateType(targetN.template)
    const insertConfig = elConfig[insertType]
    const insertProps = getDefaultProps(insertConfig)
    setToType(editor, insertProps, insertType, splitP)
    const insertP = inPlace ? targetP : calculateSiblingPath(targetP)
    Transforms.moveNodes(editor, { at: splitP, to: insertP })
    Transforms.select(editor, insertP)
    Transforms.collapse(editor, { edge: 'start' })
  })
  cleanupFn()
}

// TODO: include single ones of repeat template type
//  e.g. single empty paragraph -> on Enter -> we want to jump to next element
const hasBetterSelectTarget = (
  editor: CustomEditor,
  target: NodeEntry<CustomElement>,
  isInline: boolean,
  skip: boolean,
): boolean => {
  if (skip) return false
  const selectionP = getSelectedElement(editor)[1]
  return (
    selectionP.length !== target[1].length && hasNextSibling(editor, isInline)
  )
}

const findInsertTarget = (
  editor: CustomEditor,
  selected: NodeEntry<CustomElement>,
): {
  target?: NodeEntry<CustomElement>
  isNextTarget?: boolean
} => {
  const target = findRepeatableNode(editor, selected[1])
  if (target) {
    return { target, isNextTarget: false }
  }
  // if no target found: look if the next node has a target
  // (e.g. paragraph when pressing "enter" in a headline)
  const adjNode = getAdjacentNode(editor, 'next', selected)
  if (!adjNode) return {}
  return {
    target: findRepeatableNode(editor, adjNode[1]),
    isNextTarget: true,
  }
}

// struct allows repeats?
//     |               |
//    YES              NO
// insert first        match last element is struct?
// type in struct      |               |
//                    NO              YES
//                  selectAdjacent    escalate to parent (if not root)
export const insertRepeat = (editor: CustomEditor): void => {
  const currentElement = getSelectedElement(editor)
  const multiElementSelection = spansManyElements(editor)
  // eslint-disable-next-line prefer-const
  let { target, isNextTarget } = findInsertTarget(editor, currentElement)

  // if the current insert target is empty, and has no sibling:
  // jump out of element altogether
  // (e.g. after pressing "enter" on the last item of a list when empty)
  const deleteP = deleteOnInsert(editor, target, currentElement)
  if (deleteP) {
    const targetParent = getParent(editor, target)
    const adjNode = getAdjacentNode(editor, 'next', target)
    const deleteImmediately = adjNode && isDescendant(targetParent, adjNode)
    if (deleteImmediately) {
      return Transforms.removeNodes(editor, { at: deleteP })
    } else {
      const newTargetData = findInsertTarget(editor, targetParent) // fall back to the parent
      target = newTargetData.target
      isNextTarget = newTargetData.isNextTarget
    }
  }

  // if insert doesn't make sense, we jump to the next element instead
  if (!target) {
    selectAdjacent(editor)
    return deleteP && Transforms.removeNodes(editor, { at: deleteP })
  }
  const isInline = Editor.isInline(editor, target[0])
  if (hasBetterSelectTarget(editor, target, isInline, !!deleteP)) {
    return selectAdjacent(editor)
  }

  // fallback on parent for inline elements
  if (isInline) {
    target = getParent(editor, target)
  }

  splitAndInsert(
    editor,
    target,
    isNextTarget || multiElementSelection,
    () => deleteP && Transforms.removeNodes(editor, { at: deleteP }),
  )
}

export const handleInsert = (
  editor: CustomEditor,
  event: KeyboardEvent<HTMLDivElement>,
): void => {
  if (event.key === 'Enter' && event.shiftKey !== true) {
    event.preventDefault()
    insertRepeat(editor)
  }
}
