import { CustomEditor, EditorConfig } from '../../../custom-types'

export const withCustomConfig =
  (config: EditorConfig) =>
  (editor: CustomEditor): CustomEditor => {
    editor.customConfig = config
    return editor
  }
