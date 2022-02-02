import { CustomEditor, CustomText, NormalizeFn } from '../../../custom-types'
import {
  Descendant,
  Editor,
  Element as SlateElement,
  Node,
  NodeEntry,
  Transforms
} from 'slate'
import { ReactEditor } from 'slate-react'
import { config as elConfig } from '../../elements'
import editorConfig from '../../../config'
import { isCorrect } from './structure'

export const CHAR_LIMIT = editorConfig.maxSigns
const PSEUDO_EMPTY_STRING = '\u2060'

export const getCharCount = (nodes: (Descendant | Node)[]): number =>
  nodes.map(node => Node.string(node).length).reduce((a, b) => a + b, 0)

export const getCountDown = (editor: CustomEditor): number =>
  CHAR_LIMIT - getCharCount(editor.children)

export const toTitle = (text = ''): string =>
  text.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())

export const selectPlaceholder = (
  editor: CustomEditor,
  node: NodeEntry<CustomText>
): void => {
  const at = node[1]
  // this is a hack so that the element is selected before the text change
  // (selecting empty text nodes is a problem)
  Transforms.insertText(editor, PSEUDO_EMPTY_STRING, { at })
  ReactEditor.focus(editor)
  Transforms.select(editor, at)
  setTimeout(() => {
    Transforms.insertText(editor, '', {
      at
    })
    Transforms.select(editor, at)
  })
}

export const isEmpty = (text?: string) =>
  !text || text === '' || text === PSEUDO_EMPTY_STRING

export const handlePlaceholders: NormalizeFn<CustomText> = (
  [node, path],
  editor
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
          placeholder
        },
        { at: path }
      )
    }
  }
  return false
}
