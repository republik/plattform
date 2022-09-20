import React from 'react'
import { CustomEditor } from '../custom-types'
import { act, render } from '@testing-library/react'
import Editor, { SlateEditorProps } from '../Core'

type EditorOptions = Omit<SlateEditorProps, 'editor'>

/**
 * Render the editor-component with the given editor object to initialize it.
 * @param editor
 * @param editorOptions
 */
async function mockEditor(
  editor: CustomEditor,
  editorOptions: EditorOptions,
): Promise<CustomEditor> {
  act(() => {
    render(<Editor editor={editor} {...editorOptions} />)
  })

  return editor
}

export default mockEditor
