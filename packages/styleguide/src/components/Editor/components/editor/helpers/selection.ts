import { CustomNode, NormalizeFn } from '../../../custom-types'
import { Node, Range, Transforms } from 'slate'

export const resetSelection: (selection?: Range) => NormalizeFn<CustomNode> =
  (selection) =>
  ([node, path], editor) => {
    if (
      editor.selection &&
      selection &&
      !Range.equals(editor.selection, selection) &&
      Node.has(editor, selection.focus.path)
    ) {
      Transforms.select(editor, selection.focus.path)
      return true
    }
    return false
  }
