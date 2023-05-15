import { createEditor, Transforms } from 'slate'
import { cleanupTree } from '../Core/helpers/tree'
import { toggleMark } from '../Core/helpers/text'
import schema from '../schema/article'
import mockEditor from './mockEditor'
import { act } from '@testing-library/react'

describe('Slate Editor: Marks Handling', () => {
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

  it('should apply formatting style to selected text', async () => {
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
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    await act(async () => {
      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      await toggleMark(editor, 'italic')
    })

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum', italic: true },
          { text: ' dolor sit amet.' },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 5 },
    })
  })

  it('should remove incompatible marks', async () => {
    value = [
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum dolor sit', sub: true },
          { text: ' amet.' },
        ],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    const selection = {
      anchor: { path: [0, 1], offset: 6 },
      focus: { path: [0, 1], offset: 11 },
    }
    await act(async () => {
      await Transforms.select(editor, selection)
      await toggleMark(editor, 'sup')
    })

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum ', sub: true },
          { text: 'dolor', sup: true },
          { text: ' sit', sub: true },
          { text: ' amet.' },
        ],
      },
    ])
  })

  it('should apply formatting to word if selection is collapsed and in a word', async () => {
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
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    const selection = {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    }
    await act(async () => {
      await Transforms.select(editor, selection)
      await toggleMark(editor, 'italic')
    })

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum', italic: true },
          { text: ' dolor sit amet.' },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 5 },
    })
  })

  it('should remove active mark from corresponding selected position', async () => {
    value = [
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum', italic: true },
          { text: ' dolor sit amet.' },
        ],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    const selection = {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 5 },
    }
    await act(async () => {
      await Transforms.select(editor, selection)
      await toggleMark(editor, 'italic')
    })

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Lorem ipsum dolor sit amet.' }],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 11 },
    })
  })

  it('should remove active mark from cursor position and on if selection is collapsed', async () => {
    value = [
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum', italic: true },
          { text: ' dolor sit amet.' },
        ],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    await act(async () => {
      await Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 3 },
        focus: { path: [0, 1], offset: 3 },
      })
      await toggleMark(editor, 'italic')
    })

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Lorem ipsum dolor sit amet.' }],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 11 },
    })
  })

  it('should apply mark to whole selection, even if selection already include part with active mark', async () => {
    value = [
      {
        type: 'paragraph',
        children: [
          { text: 'Ad lorem ' },
          { text: 'ipsum', bold: true },
          { text: ' dolor sit amet.' },
        ],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    await act(async () => {
      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 2], offset: 6 },
      })
      await toggleMark(editor, 'bold')
    })

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Ad ' },
          { text: 'lorem ipsum dolor', bold: true },
          { text: ' sit amet.' },
        ],
      },
    ])
    expect(editor.selection).toEqual({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 17 },
    })
  })

  it('should support multiple marks at once', async () => {
    value = [
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum', bold: true },
          { text: ' dolor sit amet.' },
        ],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    await act(async () => {
      await Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 5 },
      })
      await toggleMark(editor, 'italic')
    })

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Lorem ' },
          { text: 'ipsum', italic: true, bold: true },
          { text: ' dolor sit amet.' },
        ],
      },
    ])
  })

  it('should fallback on slates default handling if selection collapsed and cursor is not in a word', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: 'Lorem' }],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    const editor = await act(async () => setup({ ...defaultConfig, structure }))
    await act(async () => {
      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      })
    })
    expect(editor.marks).toBeNull()

    await act(async () => toggleMark(editor, 'italic'))

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Lorem' }],
      },
    ])
    expect(editor.marks.italic).toBe(true)
  })
})
