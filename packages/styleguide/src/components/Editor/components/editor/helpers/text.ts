import {
  CustomEditor,
  CustomMarksType,
  CustomText,
  NormalizeFn,
} from '../../../custom-types'
import {
  Descendant,
  Editor,
  Element as SlateElement,
  Node,
  NodeEntry,
  Transforms,
  Range,
} from 'slate'
import { ReactEditor } from 'slate-react'
import { config as elConfig } from '../../../config/elements'
import { isAllowedType, isCorrect } from './structure'
import {
  configKeys as mKeys,
  MARKS_ALLOW_LIST,
  config as mConfig,
} from '../../../config/marks'
import { cleanupNode, overlaps } from './tree'

const PSEUDO_EMPTY_STRING = '\u2060'

export const cleanupEmptyString = (text: string): string =>
  text.replace(PSEUDO_EMPTY_STRING, '')

export const getCharCount = (nodes: (Descendant | Node)[]): number =>
  nodes.map((node) => Node.string(node).length).reduce((a, b) => a + b, 0)

export const getCountDown = (editor: CustomEditor, maxSigns: number): number =>
  maxSigns - getCharCount(editor.children)

const baseTextProps = ['text', 'placeholder', 'template', 'end']
export const cleanupText: NormalizeFn<CustomText> = ([node, path], editor) => {
  const parent = Editor.parent(editor, path)[0]
  const formatText =
    SlateElement.isElement(parent) && elConfig[parent.type].attrs?.formatText
  const allowedProps = (
    (formatText ? mKeys : MARKS_ALLOW_LIST) as string[]
  ).concat(baseTextProps)
  return cleanupNode(allowedProps)([node, path], editor)
}

export const selectNearestWord = (
  editor: CustomEditor,
  dryRun?: boolean,
): boolean => {
  if (!editor.selection || !Range.isCollapsed(editor.selection)) return false
  const anchor = Editor.before(editor, editor.selection, { unit: 'word' })
  const focus = Editor.after(editor, editor.selection, { unit: 'word' })
  if (
    anchor &&
    focus &&
    anchor.path.length === focus.path.length &&
    overlaps(anchor.path, focus.path) &&
    Editor.string(editor, { anchor, focus }).split(' ').length === 1
  ) {
    !dryRun && Transforms.select(editor, { anchor, focus })
    return true
  }
  return false
}

export const isMarkActive = (
  editor: CustomEditor,
  mKey: CustomMarksType,
): boolean => {
  // try-catch clause needed for the tests
  let marks
  try {
    marks = Editor.marks(editor)
  } catch (e) {
    // console.warn(e)
  }
  return !!marks && !!marks[mKey]
}

const removeIncompatible = (
  editor: CustomEditor,
  mKey: CustomMarksType,
): void => {
  const config = mConfig[mKey]
  if (!config.remove?.length) return
  config.remove.forEach((excludedKey) => {
    Editor.removeMark(editor, excludedKey)
  })
}

export const toggleMark = (
  editor: CustomEditor,
  mKey: CustomMarksType,
): void => {
  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  if (isCollapsed) {
    const retry = selectNearestWord(editor)
    if (retry) return toggleMark(editor, mKey)
  }

  const isActive = isMarkActive(editor, mKey)
  if (isActive) {
    Editor.removeMark(editor, mKey)
  } else {
    Editor.addMark(editor, mKey, true)
    removeIncompatible(editor, mKey)
  }
}

export const toTitle = (text = ''): string =>
  text.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase())

export const selectPlaceholder = (
  editor: CustomEditor,
  node: NodeEntry<CustomText>,
): void => {
  const at = node[1]
  // this is a hack so that the element is selected before the text change
  // (selecting empty text nodes is a problem)
  Transforms.insertText(editor, PSEUDO_EMPTY_STRING, { at })
  ReactEditor.focus(editor)
  Transforms.select(editor, at)
  setTimeout(() => {
    Transforms.insertText(editor, '', {
      at,
    })
    Transforms.select(editor, at)
  })
}

export const isEmpty = (text?: string) =>
  !text || text === '' || text === PSEUDO_EMPTY_STRING

export const getLinkInText = (text: string) => {
  // regex should only return one link!
  const regex =
    /(https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi
  const matches = text.match(regex)
  return matches && matches[0]
}

export const getFullUrl = (url: string) =>
  /^(https?:|\/|#)/.test(url) ? url : 'http://' + url

export const createLinks: NormalizeFn<CustomText> = ([node, path], editor) => {
  const parent = Editor.parent(editor, path)
  const parentNode = parent[0]

  if (!node.template || !isAllowedType('link', node.template.type)) {
    return false
  }

  const linkInText = getLinkInText(node.text)

  if (linkInText) {
    if (SlateElement.isElement(parentNode) && parentNode.type !== 'link') {
      const linkStartPoint = node.text.indexOf(linkInText)
      const linkEndPoint = linkInText.length + linkStartPoint
      const linkRange = {
        anchor: { path, offset: linkStartPoint },
        focus: { path, offset: linkEndPoint },
      }
      // don't autolink if cursor is still inside the target text
      if (
        editor.selection &&
        Range.isCollapsed(editor.selection) &&
        Range.intersection(editor.selection, linkRange)
      ) {
        return false
      }
      Transforms.wrapNodes(
        editor,
        { type: 'link', href: getFullUrl(linkInText), children: [] },
        {
          at: linkRange,
          split: true,
        },
      )
      return true
    }
  }
  return false
}

export const handlePlaceholders: NormalizeFn<CustomText> = (
  [node, path],
  editor,
) => {
  const parent = Editor.parent(editor, path)
  const parentNode = parent[0]
  const currentIndex = path[path.length - 1]
  const nextSibling = parentNode.children[currentIndex + 1]
  const prevSibling = parentNode.children[currentIndex - 1]
  const redundantSibling =
    (nextSibling && isCorrect(nextSibling, node.template)) ||
    (prevSibling && isCorrect(prevSibling, node.template))
  // console.log({ prevSibling, node, nextSibling, parentNode: parentNode.children })
  if (
    node.end ||
    redundantSibling ||
    !SlateElement.isElement(parentNode) ||
    elConfig[parentNode.type].attrs?.isVoid
  ) {
    if (node.placeholder) {
      Transforms.unsetNodes(editor, 'placeholder', { at: path })
    }
  } else {
    const placeholder = toTitle(parentNode.type) + '\u202F\u202F'
    if (!node.placeholder || node.placeholder !== placeholder) {
      Transforms.setNodes(
        editor,
        {
          placeholder,
        },
        { at: path },
      )
    }
  }
  return false
}
