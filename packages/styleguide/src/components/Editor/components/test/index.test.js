import React from 'react'
import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { fireEvent, getByTestId } from '@testing-library/react'
import { cleanupTree } from '../editor/helpers/tree'
import { insertElement } from '../editor/helpers/structure'
import { act } from 'react-dom/test-utils'

describe('Slate Editor', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  let value

  const defaultStructure = [
    {
      type: 'headline',
    },
    {
      type: ['paragraph', 'blockQuote', 'ul', 'ol'],
      repeat: true,
    },
  ]

  async function setup(structure = defaultStructure) {
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
    return editor
  }

  describe('Inline Buttons (atm only link)', () => {
    it('should be disabled unless text is selected', async () => {})
    it('should wrap a link around selected text and open form to set url', async () => {})
    it('should be active when cursor is in a link', async () => {})
    it('should remove an active link if cursor is in it', async () => {})
  })

  describe('Mark Buttons', () => {
    it('formatting should be disabled unless block type has formatText flag in config', async () => {})
    it('sub/sup should be allowed regardless of block type', async () => {})
    it('should apply formatting style to selected text', async () => {})
    it('should apply formatting from cursor position and on if selection is collapsed', async () => {})
    it('should show which marks are currently active', async () => {})
    it('should remove active mark from cursor position and on if selection is collapsed', async () => {})
    it('should remove active mark from corresponding selected position', async () => {})
    it('should apply mark to whole selection, even if selection already include part with active mark', async () => {})
    it('should support multiple marks at once', async () => {})
  })

  describe('Data Form', () => {
    it('should open attached form on double click on inline element', async () => {
      // link
    })
    it('should open attached form on double click on block element', async () => {
      // figure
    })
    it('should load parent elements forms recursively', async () => {
      // figure
    })
    it('should allow to edit the element data', async () => {})
  })
})
