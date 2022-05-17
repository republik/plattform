import { CustomEditor } from '../../../custom-types'
import { config, coreEditorAttrs } from '../../schema/elements'

export const withElAttrsConfig = (editor: CustomEditor): CustomEditor => {
  coreEditorAttrs.forEach((attr) => {
    const editorCheck = editor[attr]
    editor[attr] = (element) =>
      (config[element.type]?.attrs || {})[attr] || editorCheck(element)
  })
  return editor
}
