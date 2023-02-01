import {
  CustomDescendant,
  CustomEditor,
  LinkElement,
  ListItemElement,
  ListElement,
  ParagraphElement,
  BreakElement,
  CustomElement,
  NodeTemplate,
  CustomElementsType,
} from '../../custom-types'
import {
  Editor,
  Element as SlateElement,
  Text,
  Node,
  Transforms,
  NodeEntry,
} from 'slate'
import { getAncestry, isDescendant } from './tree'
import { config as elConfig } from '../../config/elements'
import { intersperse } from '../../../../lib/helpers'
import { getTemplateType, isCorrect, setToType } from './structure'

const ELEMENT_TAGS = {
  A: (el): Partial<LinkElement> => ({
    type: 'link',
    href: el.getAttribute('href'),
  }),
  BR: (): Partial<BreakElement> => ({ type: 'break' }),
  LI: (): Partial<ListItemElement> => ({ type: 'listItem' }),
  OL: (): Partial<ListElement> => ({ type: 'ol' }),
  P: (): Partial<ParagraphElement> => ({ type: 'paragraph' }),
  UL: (): Partial<ListElement> => ({ type: 'ul' }),
}

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  SUB: () => ({ sub: true }),
  SUP: () => ({ sup: true }),
}

export const parseHtml = (data: DataTransfer): Document | undefined => {
  const htmlData = data.getData('text/html')
  return htmlData && new DOMParser().parseFromString(htmlData, 'text/html')
}

const deserialize = (
  el: HTMLElement,
): CustomDescendant | CustomDescendant[] => {
  if (el.nodeType === 3) {
    console.log(el.textContent)
    return { text: el.textContent.replace(/[\n\r]+/g, '') }
  } else if (el.nodeType !== 1) {
    return null
  }

  const { nodeName } = el
  let parent: ChildNode = el

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat()

  if (children.length === 0) {
    children = [{ text: '' }]
  }

  if (el.nodeName === 'BODY') {
    return children
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el)
    return {
      ...attrs,
      children,
    }
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el)
    return children.map((child) => ({ ...attrs, ...child }))
  }

  return children
}

export const insertHtmlFragment = (
  editor: CustomEditor,
  fragment: Document,
): void => {
  const slateFragment = deserialize(fragment.body)
  Transforms.insertFragment(
    editor,
    Array.isArray(slateFragment) ? slateFragment : [slateFragment],
  )
}

export const parseSlate = (
  data: DataTransfer,
): CustomDescendant[] | undefined => {
  const slateData = data.getData('application/x-slate-fragment')
  return slateData && JSON.parse(decodeURIComponent(window.atob(slateData)))
}

const extractInlineNodes = (nodes: CustomDescendant[]): CustomDescendant[] => {
  let inlineEntries: NodeEntry<CustomDescendant>[] = []
  for (const [n, p] of Node.descendants({
    type: 'paragraph',
    children: nodes,
  })) {
    if (
      (SlateElement.isElement(n) && elConfig[n.type]?.attrs?.isInline) ||
      (Text.isText(n) &&
        !!n.text &&
        !inlineEntries.find((entry) => isDescendant(entry, [n, p])))
    ) {
      inlineEntries = inlineEntries.concat([[n, p]])
    }
  }
  let inlineNodes: CustomDescendant[] = inlineEntries.map((entry) => entry[0])
  inlineNodes = intersperse(inlineNodes, () => ({ text: ' ' }))
  return inlineNodes
}

const convertNodes = (
  nodes: CustomDescendant[],
  template: NodeTemplate,
): CustomDescendant[] => {
  return nodes.map((node) => {
    if (!SlateElement.isElement(node)) return node
    return {
      ...node,
      type: isCorrect(node, template) ? node.type : getTemplateType(template),
    } as CustomElement
  })
}

// low level blocks are block which don't contain other blocks
// just text or inlines
const isLowLevelBlock = (node: CustomDescendant): boolean => {
  if (Text.isText(node)) return true
  if (!elConfig[node.type]?.attrs?.isInline) {
    const testChild = node.children[0]
    if (
      !SlateElement.isElement(testChild) ||
      elConfig[testChild.type]?.attrs?.isInline
    ) {
      return true
    }
  }
}

// better approach (compliant with case 1b: we pass the ref s node and stop iterating if
// the first child of the fragment matches the allows templates by s
const getStrippedFragment = (
  fragment: CustomDescendant[],
  template: NodeTemplate,
): CustomDescendant[] => {
  if (
    fragment.length === 1 &&
    SlateElement.isElement(fragment[0]) &&
    !isLowLevelBlock(fragment[0]) &&
    !isCorrect(fragment[0], template)
  ) {
    return getStrippedFragment(fragment[0].children, template)
  }
  return fragment
}

// here we consider the type of the type of the first inline-containing block we
// want to copy (C) vs the type of the first inline-containing block selected (S)
// 3 types of inserts:
//  1. S-C block types match
//  2. no match but S allows repeat -> we extract all the blocks and converts their type to S
//  3. no match, no repeats allowed -> we extract all inline blocks and insert those
export const insertSlateFragment = (
  editor: CustomEditor,
  fragment: CustomDescendant[],
): void => {
  const { element: selectedRefEntry } = getAncestry(editor)
  const strippedFragment = getStrippedFragment(
    fragment,
    selectedRefEntry[0].template,
  )
  const copiedRefNode = strippedFragment[0]
  // case 1: perfect match
  if (
    SlateElement.isElement(copiedRefNode) &&
    copiedRefNode.type === selectedRefEntry[0].type
  ) {
    return Editor.insertFragment(editor, strippedFragment)
  }
  // case 1b: type supported by template, we need to convert the current node first
  else if (isCorrect(copiedRefNode, selectedRefEntry[0].template)) {
    return Editor.withoutNormalizing(editor, () => {
      if (SlateElement.isElement(copiedRefNode)) {
        setToType(
          editor,
          {},
          copiedRefNode.type as CustomElementsType,
          selectedRefEntry[1],
        )
      }
      Editor.insertFragment(editor, strippedFragment)
    })
  }
  // case 2
  else if (
    SlateElement.isElement(copiedRefNode) &&
    selectedRefEntry[0].template.repeat
  ) {
    // maybe we'll need to select the parent here
    return Editor.insertFragment(
      editor,
      convertNodes(strippedFragment, selectedRefEntry[0].template),
    )
  }
  return Editor.insertFragment(editor, extractInlineNodes(fragment))
}
