import {
  CustomEditor,
  CustomMarksType,
  CustomText,
  DecorateFn,
  NormalizeFn,
} from '../../custom-types'
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
import { config as elConfig } from '../../config/elements'
import { isAllowedType, isCorrect } from './structure'
import {
  configKeys as mKeys,
  MARKS_ALLOW_LIST,
  config as mConfig,
} from '../../config/marks'
import { config as charConfig } from '../../config/special-chars'
import { cleanupNode, overlaps } from './tree'
import { SelectionEdge } from 'slate/dist/interfaces/types'

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

export const selectEmptyParentPath = (
  editor: CustomEditor,
  path: number[],
  edge: SelectionEdge = 'start',
): void => {
  ReactEditor.focus(editor)
  Transforms.select(editor, path)
  Transforms.collapse(editor, { edge })
}

export const selectEmptyTextNode = (
  editor: CustomEditor,
  node: NodeEntry<CustomText>,
): void => {
  const parent = Editor.parent(editor, node[1])
  const edge = node[1].slice(-1)[0] === 0 ? 'start' : 'end'
  selectEmptyParentPath(editor, parent[1], edge)
}

export const isEmpty = (text?: string) => !text || text === ''

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
    const placeholder = parentNode.type
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

export const ERROR_CHARS = charConfig.map((char) => char.render).filter(Boolean)
export const INVISIBLE_CHARS = charConfig
  .map((char) => char.isInvisible && char.insert)
  .filter(Boolean)

export const flagChars: (
  chars: string[],
  mKey: CustomMarksType,
) => DecorateFn<CustomText> =
  (chars, mKey) =>
  ([node, path]) => {
    const ranges: Range[] = []
    chars.forEach((char) => {
      const { text } = node
      const parts = text.split(char)
      let offset = 0

      parts.forEach((part, i) => {
        if (i !== 0) {
          ranges.push({
            anchor: { path, offset: offset - 1 },
            focus: { path, offset },
            [mKey]: true,
          })
        }

        offset = offset + part.length + 1
      })
    })
    return ranges
  }

export const insertSpecialChars = (editor: CustomEditor, chars: string) => {
  if (chars.length === 1) return Transforms.insertText(editor, chars)
  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  if (isCollapsed) {
    Transforms.insertText(editor, chars)
    return Transforms.move(editor, {
      distance: 1,
      unit: 'character',
      reverse: true,
    })
  }
  const start = Range.start(selection)
  const startChar = chars[0]
  Transforms.insertText(editor, startChar, { at: start })
  const end = Range.end(selection)
  const endLocation = { path: end.path, offset: end.offset + 1 }
  const endChar = chars[1]
  Transforms.insertText(editor, endChar, { at: endLocation })
  Transforms.select(editor, {
    anchor: { path: start.path, offset: start.offset + 1 },
    focus: endLocation,
  })
}

export const isValidHttpUrl = (test: string): boolean => {
  try {
    new URL(test)
  } catch (_) {
    return false
  }
  return true
}
