import { CustomNode, NormalizeFn } from '../../custom-types'
import { Editor, Node, Range, Transforms } from 'slate'

export const resetSelection: (selection?: Range) => NormalizeFn<CustomNode> =
  (selection) =>
  ([node, path], editor) => {
    // restore previously saved selection
    if (
      editor.selection &&
      selection &&
      !Range.equals(editor.selection, selection) &&
      Node.has(editor, selection.focus.path)
    ) {
      Transforms.select(editor, selection.focus.path)
      // tree has not changed
      return false
    }
    // factory reset :-)
    if (!selection && !editor.selection) {
      const node = Editor.first(editor, [])
      if (node) {
        Transforms.select(editor, node[1])
        // tree has not changed
        return false
      }
    }
    return false
  }
