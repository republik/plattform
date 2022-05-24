import { CustomEditor, EditorConfig } from '../../../custom-types'
import { getCharCount } from '../helpers/text'
import { unwrapOnPaste } from '../helpers/structure'

export const withInsert =
  (config: EditorConfig) =>
  (editor: CustomEditor): CustomEditor => {
    const { insertText, insertFragment, insertNode, insertData } = editor
    const maxSigns = config.maxSigns

    editor.insertData = (data: DataTransfer) => {
      if (unwrapOnPaste(editor, data)) return
      insertData(data)
    }

    editor.insertText = (text) => {
      // console.log('insert text', maxSigns)
      if (maxSigns && getCharCount(editor.children) >= maxSigns) {
        // console.log('max reached')
        return
      }
      insertText(text)
    }

    editor.insertFragment = (nodes) => {
      if (
        maxSigns &&
        getCharCount(editor.children) + getCharCount(nodes) >= maxSigns
      ) {
        return
      }
      // console.log('insert fragment', nodes)
      insertFragment(nodes)
    }

    editor.insertNode = (node) => {
      if (
        maxSigns &&
        getCharCount(editor.children) + getCharCount([node]) >= maxSigns
      ) {
        return
      }
      // console.log('insert node', node)
      insertNode(node)
    }

    return editor
  }
