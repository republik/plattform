import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { toggleElement } from '../editor/helpers/structure'
import { cleanupTree } from '../editor/helpers/tree'

describe('Slate Editor: Inline Insertion', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema: 'article' }

  const defaultStructure = [
    {
      type: 'headline',
    },
    {
      type: ['paragraph', 'blockQuote', 'ul', 'ol'],
      repeat: true,
    },
  ]

  async function setup(structure = defaultStructure, config = defaultConfig) {
    const mock = getMockEditor()
    const [editor] = await buildTestHarness(Editor)({
      editor: mock,
      initialValue: value,
      componentProps: {
        structure,
        config,
        value,
        setValue: (val) => (value = val),
      },
    })
    return editor
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
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      toggleElement(editor, 'link')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              href: 'https://',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
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
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 9 })
      toggleElement(editor, 'link')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              href: 'https://',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
    })

    it('should remove the element if it is already there and cursor is in it', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              href: 'https://',
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
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 1], offset: 2 })
      toggleElement(editor, 'link')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
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
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

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
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 6 })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

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
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

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
          type: 'headline',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'headline',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'headline',
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
