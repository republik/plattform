/**
 --- Disabled due to slate-test-utils causing severe issues with building
 --- and apps depending on styleguide
 --- re-enable if a valid alternative for slate-test-utils has been found
 -- or the issues have been fixed

import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { cleanupTree } from '../editor/helpers/tree'
import { toggleMark } from '../editor/helpers/text'
import schema from '../../schema/article'

describe('Slate Editor: Marks Handling', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(structure, config = defaultConfig) {
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
    const editor = await setup(structure)

    await Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 11 },
    })
    toggleMark(editor, 'italic')
    await new Promise(process.nextTick)

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
    const editor = await setup(structure)
    const selection = {
      anchor: { path: [0, 1], offset: 6 },
      focus: { path: [0, 1], offset: 11 },
    }

    await Transforms.select(editor, selection)
    toggleMark(editor, 'sup')
    await new Promise(process.nextTick)

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
    const editor = await setup(structure)
    const selection = {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    }

    await Transforms.select(editor, selection)
    toggleMark(editor, 'italic')
    await new Promise(process.nextTick)

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
    const editor = await setup(structure)
    const selection = {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 5 },
    }

    await Transforms.select(editor, selection)
    toggleMark(editor, 'italic')
    await new Promise(process.nextTick)

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
    const editor = await setup(structure)

    await Transforms.select(editor, {
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 1], offset: 3 },
    })
    toggleMark(editor, 'italic')
    await new Promise(process.nextTick)

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
    const editor = await setup(structure)

    await Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 2], offset: 6 },
    })
    toggleMark(editor, 'bold')
    await new Promise(process.nextTick)

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
    const editor = await setup(structure)

    await Transforms.select(editor, {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 5 },
    })
    toggleMark(editor, 'italic')
    await new Promise(process.nextTick)

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
    const editor = await setup(structure)

    await Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    })
    expect(editor.marks).toBeNull()
    toggleMark(editor, 'italic')
    await new Promise(process.nextTick)

    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Lorem' }],
      },
    ])
    expect(editor.marks.italic).toBe(true)
  })
})
*/
