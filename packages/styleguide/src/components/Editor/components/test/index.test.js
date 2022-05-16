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

  describe('On Enter (New Elements Insertion)', () => {
    it('should create a new element of the same type if possible (repeatable)', async () => {})
    it('should split the element in two if cursor is somewhere in the middle', async () => {
      // with formatting/links
    })
    it('should fallback on next repeatable element', async () => {})
    it('should split the element in two and fallback if cursor is somewhere in a non-repeatable element', async () => {})
    it('should fallback successfully on next repeatable element from within nested structure', async () => {
      // figure caption
    })
    it('should create new nested repeatable blocks if we are inside a nested repeatable structure', async () => {})
    it('should exit nested repeatable structure if current block is the last repeated element and empty', async () => {})
    it('should not exit nested repeatable structure if current block is not the last element', async () => {})
    it('should navigate to the next element if neither the current nor the next element are repeatable', async () => {})
  })

  describe('On Tab', () => {
    it('should allow forward and backward navigation', async () => {})
    it('should navigate into nested elements', async () => {})
    it('should still work after inserts/converts', async () => {})
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
