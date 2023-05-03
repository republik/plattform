import { createEditor, Transforms } from 'slate'
import { toggleElement } from '../Core/helpers/structure'
import { cleanupTree } from '../Core/helpers/tree'
import schema from '../schema/article'
import mockEditor from './mockEditor'
import { act } from '@testing-library/react'

describe('Slate Editor: Inline Insertion', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(config) {
    return await mockEditor(createEditor(), {
      config,
      value,
      setValue: (val) => (value = val),
    })
  }

  describe('non-void element (e.g. link)', () => {
    it('should wrap the element around selected text', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 6 },
          focus: { path: [0, 0], offset: 11 },
        })
        await toggleElement(editor, 'link')
      })
      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: {
          offset: 5,
          path: [0, 1, 0],
        },
        focus: {
          offset: 5,
          path: [0, 1, 0],
        },
      })
    })

    it('should wrap the element around corresponding word if selection is collapsed', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 9 })
        await toggleElement(editor, 'link')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: {
          offset: 5,
          path: [0, 1, 0],
        },
        focus: {
          offset: 5,
          path: [0, 1, 0],
        },
      })
    })

    it('should work when text has some marks', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            { text: 'ipsum', bold: true },
            { text: ' dolor' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, {
          anchor: { path: [0, 1], offset: 0 },
          focus: { path: [0, 1], offset: 5 },
        })
        await toggleElement(editor, 'link')
      })
      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum', bold: true }],
            },
            { text: ' dolor' },
          ],
        },
      ])
      expect(editor.selection.anchor.path).toEqual([0, 1, 0])
    })

    it('should work across an entire node', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 18 },
        })
        await toggleElement(editor, 'memo')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: '' },
            {
              type: 'memo',
              children: [{ text: 'Lorem ipsum dolor.' }],
            },
            { text: '' },
          ],
        },
      ])
      expect(editor.selection.anchor.path).toEqual([0, 1, 0])
    })

    it('should work across complex inline/text nodes', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum', bold: true }],
            },
            { text: ' dolor' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 2], offset: 2 },
        })
        await toggleElement(editor, 'inlineCode')
      })
      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lore' },
            {
              type: 'inlineCode',
              children: [{ text: 'm ipsum d' }],
            },
            { text: 'olor' },
          ],
        },
      ])
      expect(editor.selection.anchor.path).toEqual([0, 1, 0])
    })

    it('should remove the element if it is already there and cursor is in it', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 1], offset: 2 })
        await toggleElement(editor, 'link')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: {
          offset: 6,
          path: [0, 0],
        },
        focus: {
          offset: 6,
          path: [0, 0],
        },
      })
    })

    it('should handle nested inlines on insert', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 9 })
        await toggleElement(editor, 'link')
        await Transforms.select(editor, { path: [0, 1, 0], offset: 3 })
        await toggleElement(editor, 'memo')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [
                { text: '' },
                { type: 'memo', children: [{ text: 'ipsum' }] },
                { text: '' },
              ],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
    })

    it('should delete outermost nested inline', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [
                { text: '' },
                { type: 'memo', children: [{ text: 'ipsum' }] },
                { text: '' },
              ],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 1, 1, 0], offset: 3 })
        await toggleElement(editor, 'link')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            { type: 'memo', children: [{ text: 'ipsum' }] },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
    })

    it('should delete innermost nested inline', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [
                { text: '' },
                { type: 'memo', children: [{ text: 'ipsum' }] },
                { text: '' },
              ],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 1, 1, 0], offset: 3 })
        await toggleElement(editor, 'memo')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            { type: 'link', children: [{ text: 'ipsum' }] },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
    })
  })

  describe('void element (e.g. break)', () => {
    it('should delete selected text and insert element', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 6 },
          focus: { path: [0, 0], offset: 11 },
        })
        await toggleElement(editor, 'break')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'break',
              children: [{ text: '' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
    })

    it('should insert element at cursor position if selection is collapsed', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 6 })
        await toggleElement(editor, 'break')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'break',
              children: [{ text: '' }],
            },
            { text: 'ipsum dolor sit amet.' },
          ],
        },
      ])
    })

    it('should not set the cursor on the element if it cannot be shown as selected', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'LoremIpsum' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
          repeat: true,
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 5 })
        await toggleElement(editor, 'break')
      })
      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem' },
            { type: 'break', children: [{ text: '' }] },
            { text: 'Ipsum' },
          ],
        },
      ])
      expect(editor.selection.focus).toEqual({ path: [0, 2], offset: 0 })
    })

    it('should remove the element if it is already there and cursor is in it', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'break',
              children: [{ text: '' }],
            },
            { text: 'ipsum dolor sit amet.' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
        await toggleElement(editor, 'break')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ])
    })

    it('should not change anything if the element is not allowed', async () => {
      value = [
        {
          type: 'pullQuoteText',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'pullQuoteText',
        },
      ]
      const editor = await act(async () =>
        setup({ ...defaultConfig, structure }),
      )
      await act(async () => {
        await Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 6 },
          focus: { path: [0, 0], offset: 11 },
        })
        await toggleElement(editor, 'link')
      })

      expect(cleanupTree(value)).toEqual([
        {
          type: 'pullQuoteText',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
    })
  })
})
