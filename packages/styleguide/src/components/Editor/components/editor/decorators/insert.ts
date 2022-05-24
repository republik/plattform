import { CustomEditor } from '../../../custom-types'
import { getCharCount } from '../helpers/text'
import { unwrapOnPaste } from '../helpers/structure'

export const withInsert =
  (charLimit: number) =>
  (editor: CustomEditor): CustomEditor => {
    const { insertText, insertFragment, insertNode, insertData } = editor

    editor.insertText = (text) => {
      if (getCharCount(editor.children) >= charLimit) {
        return
      }
      insertText(text)
    }

    editor.insertFragment = (nodes) => {
      if (getCharCount(editor.children) + getCharCount(nodes) >= charLimit) {
        return
      }
      // console.log('insert fragment', nodes)
      insertFragment(nodes)
    }

    editor.insertNode = (node) => {
      if (getCharCount(editor.children) + getCharCount([node]) >= charLimit) {
        return
      }
      // console.log('insert node', node)
      insertNode(node)
    }

    editor.insertData = (data: DataTransfer) => {
      if (unwrapOnPaste(editor, data)) return
      insertData(data)
    }

    return editor
  }
