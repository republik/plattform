import React from 'react'
import Editor from './components/editor/index'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor } from 'slate'

describe('Editor test-suite', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  it('should initialize according to structure', async () => {
    let value = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]

    const structure = [
      {
        type: 'headline',
      },
      {
        type: ['paragraph', 'pullQuote', 'figure', 'list', 'blockQuote'],
        repeat: true,
      },
    ]

    const mock = getMockEditor()
    const [editor] = await buildTestHarness(Editor)({
      editor: mock,
      initialValue: value,
      componentProps: {
        structure,
        value,
        setValue: (val) => (value = val),
      },
    })

    expect(editor.children).toEqual(value)
    expect(editor.children).toEqual([
      {
        type: 'headline',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  })
})
