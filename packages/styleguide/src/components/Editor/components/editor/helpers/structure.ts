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
  deleteExcessChildren,
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
import { config as elConfig } from '../../../config/elements'
import { getCharCount, selectNearestWord } from './text'

const DEFAULT_STRUCTURE: NodeTemplate[] = [{ type: ['text'], repeat: true }]
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
  return calculateSiblingPath(Range.end(selection).path)
}

const convertBlock = (
  editor: CustomEditor,
  element: CustomElement,
  customTarget?: NodeEntry<CustomNode>,
): number[] => {
  const { element: targetE, topLevelContainer: targetC } = getAncestry(
    editor,
    customTarget,
  )
  const target = targetC || targetE

  const targetConfig = elConfig[target[0].type]
  const insertConfig = elConfig[element.type]
  const insertPartial = {
    type: element.type,
    ...(insertConfig.defaultProps || {}),
  }

  if (
    insertConfig.component === targetConfig.component &&
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
    elementPath = convertBlock(editor, element)
  }

  if (elementPath) {
    Transforms.select(editor, elementPath)
    Transforms.collapse(editor, { edge: 'end' })
  }

  return elementPath
}

const fixNode = (
  node: CustomDescendant | undefined,
  path: number[],
  currentTemplate: NodeTemplate,
  nextTemplate: NodeTemplate | undefined,
  editor: CustomEditor,
): void => {
  const newNode = buildFromTemplate(currentTemplate)
  // console.log('FIX NODE', { node, path, currentTemplate, newNode })

  if (!node || isCorrect(node, nextTemplate)) {
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
    elConfig[elementType].attrs?.isMain
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

export const fixStructure: (
  structure?: NodeTemplate[],
) => NormalizeFn<CustomAncestor> =
  (structure = DEFAULT_STRUCTURE) =>
  ([node, path], editor) => {
    // console.log('MATCH STRUCTURE', { structure })
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
        fixNode(currentNode, currentPath, currentTemplate, nextTemplate, editor)
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

// unwrap on paste if simple block with inline children
export const unwrapOnPaste = (
  editor: CustomEditor,
  data: DataTransfer,
): boolean => {
  const slateData = data.getData('application/x-slate-fragment')
  if (slateData) {
    const fragment = JSON.parse(decodeURIComponent(window.atob(slateData)))
    // console.log('paste fragment', fragment)
    const unwrappedFragment =
      fragment && fragment.length === 1 && fragment[0].children
    if (
      Editor.isInline(editor, unwrappedFragment[0]) ||
      Text.isText(unwrappedFragment[0])
    ) {
      // console.log('paste this one instead', unwrappedFragment)
      Transforms.insertFragment(editor, unwrappedFragment)
      return true
    }
  }
  return false
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
