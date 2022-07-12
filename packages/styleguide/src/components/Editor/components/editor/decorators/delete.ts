import { CustomEditor } from '../../../custom-types'
import { Range, Transforms } from 'slate'
import { getAncestry } from '../helpers/tree'
import { getCharCount } from '../helpers/text'

export const withDelete = (editor: CustomEditor): CustomEditor => {
  const { deleteBackward } = editor

  editor.deleteBackward = (unit) => {
    if (unit === 'character') {
      const { element: parent } = getAncestry(editor)
      // e.g. deleting all the text in a blockquote
      // -> we want to delete the whole blockquote
      if (Range.isCollapsed(editor.selection) && !getCharCount([parent[0]])) {
        // TODO: fix cursor -> goes down instead of up
        return Transforms.removeNodes(editor, { at: parent[1] })
      }
    }
    deleteBackward(unit)
  }

  return editor
}
