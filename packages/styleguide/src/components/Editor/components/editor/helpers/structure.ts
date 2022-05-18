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
} from '../../../custom-types'
import {
  Editor,
  Element as SlateElement,
  Text,
  Transforms,
  Range,
  Node,
  NodeEntry,
} from 'slate'
import {
  calculateSiblingPath,
  findInsertTarget,
  getAncestry,
  getParent,
  getSelectedElement,
  getSiblingNode,
  hasNextSibling,
  isDescendant,
  selectAdjacent,
  spansManyElements,
} from './tree'
import { config as elConfig } from '../../schema/elements'
import { getCharCount, selectNearestWord } from './text'

const DEFAULT_STRUCTURE: NodeTemplate[] = [{ type: ['text'], repeat: true }]
const VOID_STRUCTURE: NodeTemplate[] = [{ type: 'text' }]
export const TEXT = { text: '' }

const isAllowedType = (
  elType: TemplateType,
  allowedTypes: TemplateType | TemplateType[],
): boolean =>
  Array.isArray(allowedTypes)
    ? allowedTypes.some((t) => t === elType)
    : allowedTypes === elType

export const isCorrect = (
  node: CustomDescendant | undefined,
  template: NodeTemplate | undefined,
): boolean => {
  if (!node && !template) return true
  if (!node || !template) return false
  if (Text.isText(node))
    return isAllowedType('text', template.type) && node.end === template.end
  if (SlateElement.isElement(node))
    return isAllowedType(node.type, template.type)
}

const getTemplateType = (
  template?: NodeTemplate,
): CustomElementsType | undefined => {
  if (!template) return
  const nodeType = Array.isArray(template.type)
    ? template.type[0]
    : template.type
  return nodeType !== 'text' ? nodeType : undefined
}

const buildTextNode = (isEnd: boolean): CustomText => {
  const end = isEnd ? { end: true } : {}
  return {
    ...TEXT,
    ...end,
  }
}

export const buildElement = (
  elKey: CustomElementsType,
  config?: ElementConfigI,
): CustomElement => {
  const isVoid = elConfig[elKey].attrs?.isVoid
  const defaultProps = config?.defaultProps || {}
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
  if (!structure) return
  for (let i = 0; i < structure.length; i++) {
    const elType = getTemplateType(structure[i])
    // console.log({ elType, isMain: elType && elConfig[elType].attrs?.isMain })
    if (elType && elConfig[elType].attrs?.isMain) return elType
  }
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
  const { text: target, element: parent } = getAncestry(editor)
  if (parent[0].type === element.type) {
    Transforms.unwrapNodes(editor, { at: parent[1], voids: true })
    return
  }
  if (!target) return
  const isCollapsed = Range.isCollapsed(selection)
  if (isCollapsed && elConfig[element.type].attrs?.isVoid) {
    Transforms.insertNodes(editor, element)
  } else if (isCollapsed) {
    const retry = selectNearestWord(editor)
    return retry ? toggleInline(editor, element) : undefined
  } else {
    Transforms.wrapNodes(editor, element, { split: true })
  }
  return calculateSiblingPath(Range.end(selection).path)
}

const convertBlock = (
  editor: CustomEditor,
  element: CustomElement,
  elKey: CustomElementsType,
  insertConfig: ElementConfigI,
): number[] => {
  const { element: targetE, topLevelContainer: targetC } = getAncestry(editor)
  const target = targetC || targetE

  const targetConfig = elConfig[target[0].type]
  const insertPartial = { type: elKey, ...(insertConfig.defaultProps || {}) }

  if (
    insertConfig.Component.name === targetConfig.Component.name &&
    insertConfig.defaultProps
  ) {
    Transforms.setNodes(editor, insertPartial, { at: target[1] })
    return target[1]
  }

  const mainElKey = getMainElement(insertConfig.structure)
  const mainElPartial = mainElKey && {
    type: mainElKey,
    ...(elConfig[mainElKey].defaultProps || {}),
  }
  const targetMainElKey = getMainElement(targetConfig.structure)

  let insertPath = target[1]
  const getMainEls = (n) =>
    SlateElement.isElement(n) && n.type === targetMainElKey

  // TODO: insert path when mainElKey doesn't allow for repeats (no use case atm)
  Editor.withoutNormalizing(editor, () => {
    if (targetMainElKey && mainElKey) {
      Transforms.setNodes(editor, insertPartial, { at: target[1] })
      const updatedChildren = setChildren(
        editor,
        target,
        mainElPartial,
        getMainEls,
      )
      insertPath = target[1].concat(updatedChildren - 1)
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
  const { selection } = editor
  if (!selection) return

  const config = elConfig[elKey]
  const element = buildElement(elKey, config)

  let elementPath: number[]

  const isInline = config.attrs?.isInline
  if (isInline) {
    elementPath = toggleInline(editor, element)
  } else {
    elementPath = convertBlock(editor, element, elKey, config)
  }

  if (elementPath) {
    Transforms.select(editor, elementPath)
    Transforms.collapse(editor, { edge: 'end' })
  }
  return elementPath
}

const insertMissingNode = (
  node: CustomDescendant | undefined,
  path: number[],
  currentTemplate: NodeTemplate,
  nextTemplate: NodeTemplate | undefined,
  editor: CustomEditor,
): void => {
  // console.log('INSERT MISSING NODE', { node, path })
  if (!node || isCorrect(node, nextTemplate)) {
    const newNode = buildFromTemplate(currentTemplate)
    // console.log('insert new node and return', { newNode })
    return Transforms.insertNodes(editor, newNode, {
      at: path,
    })
  }
  // console.log('convert current node')
  // TODO: what if the current node is an inline element
  //  and the template is a block?
  if (SlateElement.isElement(node)) {
    // console.log('unwrap')
    Transforms.unwrapNodes(editor, { at: path })
  }
  const templateType = getTemplateType(currentTemplate)
  const isVoid = templateType && elConfig[templateType].attrs?.isVoid
  const newNode = buildFromTemplate(currentTemplate)
  // console.log({ newNode })
  if (SlateElement.isElement(newNode) && !isVoid) {
    // console.log('wrap')
    return Transforms.wrapNodes(editor, newNode, { at: path })
  }
  if (Text.isText(newNode)) {
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
    elConfig[elementType].attrs?.isMain
  )
}

const deleteExcessChildren = (
  from: number,
  node: CustomAncestor,
  path: number[],
  editor: CustomEditor,
): void => {
  // console.log('DELETE EXCESS', from, 'vs', node.children.length, node)
  for (let i = node.children.length - 1; i >= from; i--) {
    // console.log(i)
    Transforms.removeNodes(editor, { at: path.concat(i) })
  }
}

export const fixStructure: (
  nodeStructure?: NodeTemplate[],
) => NormalizeFn<CustomAncestor> =
  (nodeStructure = DEFAULT_STRUCTURE) =>
  ([node, path], editor) => {
    // console.log('MATCH STRUCTURE')
    const structure =
      nodeStructure ||
      (Editor.isVoid(editor, node) ? VOID_STRUCTURE : DEFAULT_STRUCTURE)
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
        // this is here mostly to delete unwanted <br> elements
        Transforms.removeNodes(editor, { at: currentPath })
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
        insertMissingNode(
          currentNode,
          currentPath,
          currentTemplate,
          nextTemplate,
          editor,
        )
        return true
      }
    }
    if (node.children.length > structure.length + repeatOffset) {
      deleteExcessChildren(structure.length + repeatOffset, node, path, editor)
      return true
    }
    return false
  }

export const insertOnKey =
  (keyCombo: KeyCombo, elKey: CustomElementsType) =>
  (editor: CustomEditor, event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === keyCombo.name && event.shiftKey === !!keyCombo.shift) {
      event.preventDefault()
      toggleElement(editor, elKey)
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
  let target = findInsertTarget(editor)
  let nextTarget = false
  let deleteP

  // if no target found: look if the next sibling has a target
  // (e.g. paragraph when pressing "enter" in a headline)
  if (!target) {
    const nextNode = getSiblingNode(editor, 'next', currentElement)
    if (nextNode) {
      target = findInsertTarget(editor, nextNode[1])
      nextTarget = true
    }
  }

  // if the current target is empty, and has no sibling:
  // jump out of element altogether
  // (e.g. after pressing "enter" on the last item of a list when empty)
  const isEmptyTarget = target && getCharCount([target[0]]) === 0
  // console.log({ target, isEmptyTarget, editor })
  if (isEmptyTarget) {
    const nextPath = calculateSiblingPath(currentElement[1])
    const nextNode = Node.has(editor, nextPath) && Editor.node(editor, nextPath)
    // console.log({ nextNode })
    const hasSibling =
      nextNode &&
      SlateElement.isElement(nextNode[0]) &&
      nextNode[0].type === target[0].type
    const parent = getParent(editor, target)
    // console.log({ nextNode, target })
    if (!hasSibling && parent) {
      // console.log({ parent })
      deleteP = target[1]
      const nextNode = getSiblingNode(editor, 'next', target)
      const deleteImmediately = nextNode && isDescendant(parent, nextNode)
      target = findInsertTarget(editor, parent[1]) // fall back to the parent
      if (deleteImmediately) {
        return Transforms.removeNodes(editor, { at: deleteP })
      }
    }
  }

  // if insert doesn't make sense, we jump to the next element instead
  if (!target) {
    return selectAdjacent(editor)
  }

  const [targetN, targetP] = target

  if (!deleteP) {
    const isInline = Editor.isInline(editor, target[0])
    const selectionP = getSelectedElement(editor)[1]
    if (
      selectionP.length !== targetP.length &&
      hasNextSibling(editor, isInline)
    ) {
      return selectAdjacent(editor)
    }
  }

  let insertP
  Editor.withoutNormalizing(editor, () => {
    // console.log('insert', { target })
    // split nodes at selection and move the second half of the split
    // in the first position where repeats are allowed
    Transforms.splitNodes(editor, { always: true })
    // since the node got split, splitP != selectionP
    const splitP = getSelectedElement(editor)[1]
    Transforms.setNodes(
      editor,
      { type: getTemplateType(targetN.template) },
      { at: splitP },
    )
    insertP =
      nextTarget || multiElementSelection
        ? targetP
        : calculateSiblingPath(targetP)
    Transforms.moveNodes(editor, { at: splitP, to: insertP })
    Transforms.select(editor, insertP)
    Transforms.collapse(editor, { edge: 'start' })
  })
  if (deleteP) {
    Transforms.removeNodes(editor, { at: deleteP })
  }
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
