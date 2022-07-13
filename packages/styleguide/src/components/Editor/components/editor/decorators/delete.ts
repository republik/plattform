import { CustomEditor } from '../../../custom-types'
import { Transforms } from 'slate'
import { getAncestry, selectAdjacent } from '../helpers/tree'
import { getCharCount } from '../helpers/text'

export const withDelete = (editor: CustomEditor): CustomEditor => {
  const { deleteBackward } = editor

  editor.deleteBackward = (unit) => {
    if (unit === 'character') {
      const { element: parent } = getAncestry(editor)
      // e.g. deleting all the text in a blockquote
      // -> we want to delete the whole blockquote
      if (getCharCount([parent[0]]) === 0) {
        selectAdjacent(editor, 'previous')
        return Transforms.removeNodes(editor, { at: parent[1] })
      }
    }
    deleteBackward(unit)
  }

  return editor
}
