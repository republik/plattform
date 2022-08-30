import { CustomEditor, EditorConfig } from '../../custom-types'
import { getCharCount } from '../helpers/text'
import { resetSelection } from '../helpers/selection'
import {
  parseSlate,
  insertSlateFragment,
  parseHtml,
  insertHtmlFragment,
} from '../helpers/copy-paste'

// related issue: https://github.com/ianstormtaylor/slate/issues/5010
export const withInsert =
  (config: EditorConfig) =>
  (editor: CustomEditor): CustomEditor => {
    const { insertText, insertFragment, insertNode, insertData } = editor
    const maxSigns = config.maxSigns

    editor.insertData = (data: DataTransfer) => {
      const originalSelection = JSON.parse(JSON.stringify(editor.selection))
      const slateFragment = parseSlate(data)
      const htmlFragment = parseHtml(data)
      if (slateFragment) {
        insertSlateFragment(editor, slateFragment)
      } else if (htmlFragment) {
        insertHtmlFragment(editor, htmlFragment)
      } else {
        insertData(data)
      }
      resetSelection(originalSelection)([editor, []], editor)
    }

    editor.insertText = (text) => {
      // console.log('insert text', maxSigns)
      if (maxSigns && getCharCount(editor.children) + text.length > maxSigns) {
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
