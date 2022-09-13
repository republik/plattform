import {
  CustomDescendant,
  CustomEditor,
  LinkElement,
  ListItemElement,
  ListElement,
  ParagraphElement,
  BreakElement,
} from '../../custom-types'
import {
  Editor,
  Element as SlateElement,
  Text,
  Node,
  NodeEntry,
  Transforms,
} from 'slate'
import { isDescendant } from './tree'
import { config as elConfig } from '../../config/elements'

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
    console.log({ attrs })
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

export const insertSlateFragment = (
  editor: CustomEditor,
  fragment: CustomDescendant[],
): void => {
  let inlineNodes: NodeEntry<CustomDescendant>[] = []
  for (const [n, p] of Node.descendants({
    type: 'paragraph',
    children: fragment,
  })) {
    if (SlateElement.isElement(n) && elConfig[n.type]?.attrs?.isInline) {
      inlineNodes = inlineNodes.concat([[n, p]])
    } else if (
      Text.isText(n) &&
      !!n.text &&
      !inlineNodes.find((entry) => isDescendant(entry, [n, p]))
    ) {
      inlineNodes = inlineNodes.concat([[n, p]])
    }
  }
  Editor.insertFragment(
    editor,
    inlineNodes.map((entry) => entry[0]),
  )
}
