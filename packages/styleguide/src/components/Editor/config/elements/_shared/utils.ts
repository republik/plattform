import { CustomElement, NormalizeFn } from '../../../custom-types'
import { Editor, Transforms } from 'slate'

export const unwrapWhenEmpty: NormalizeFn<CustomElement> = (
  [node, path],
  editor,
) => {
  if (Editor.string(editor, path) === '') {
    Transforms.unwrapNodes(editor, { at: path })
    return true
  }
  return false
}
