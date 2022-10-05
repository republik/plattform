import { CustomEditor } from '../../custom-types'
import { Transforms } from 'slate'
import { getAncestry, getParent } from '../helpers/tree'
import { getCharCount } from '../helpers/text'

export const withDelete = (editor: CustomEditor): CustomEditor => {
  const { deleteBackward } = editor

  editor.deleteBackward = (unit) => {
    if (unit === 'character') {
      const { element } = getAncestry(editor)
      const parent = getParent(editor, element)
      // e.g. deleting all the text in a blockquote
      // -> we want to delete the whole blockquote
      if (getCharCount([(parent || element)[0]]) === 0) {
        return Transforms.removeNodes(editor, { at: element[1] })
      }
    }
    deleteBackward(unit)
  }

  return editor
}
