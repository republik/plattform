import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { cleanupTree, selectAdjacent } from '../editor/helpers/tree'

describe('Slate Editor: Navigation (On Tab)', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  let value

  async function setup(structure) {
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

  it('should allow forward and backward navigation (incl. nested elements)', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: 'Lorem ipsum' }],
      },
      {
        type: 'figure',
        children: [
          {
            type: 'figureImage',
            children: [{ text: '' }],
          },
          {
            type: 'figureCaption',
            children: [
              { text: 'A butterfly' },
              { type: 'figureByline', children: [{ text: 'N. Hardy' }] },
              { text: '', end: true },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'CO' },
          { text: '2', sub: true },
          {
            type: 'break',
            children: [{ text: '' }],
          },
          { text: 'levels are ' },
          {
            type: 'link',
            href: 'https://www.republik.ch',
            children: [{ text: 'kinda funny' }],
          },
          { text: '' },
        ],
      },
      {
        type: 'ul',
        ordered: false,
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
          {
            type: 'listItem',
            children: [{ text: 'Two' }],
          },
        ],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'figure', 'ul'],
        repeat: true,
      },
    ]
    const editor = await setup(structure)
    await Transforms.select(editor, {
      path: [0, 0],
      offset: 3,
    })

    // TODO: select image too
    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 0, 0], offset: 0 })

    // forward tab nav
    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 1, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 1], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 3], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 4, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 5], offset: 1 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 0, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 1, 0], offset: 0 })

    // we cannot go any further
    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 1, 0], offset: 0 })

    // backward tab nav
    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 0, 0], offset: 3 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 5], offset: 1 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 4, 0], offset: 11 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 3], offset: 11 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 1], offset: 1 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 2 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 1, 0], offset: 8 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 0], offset: 11 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 0, 0], offset: 0 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 11 })

    // we cannot go any further
    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 11 })
  })

  it('should select next node after end of the selection if navigating forward and multiple blocks are selected', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Fourteen' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Seven' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Eleven' }],
      },
    ]
    const structure = [
      {
        type: 'headline',
      },
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    const editor = await setup(structure)
    await Transforms.select(editor, {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [0, 0], offset: 4 },
    })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 0 })
  })

  it('should select next node after start of the selection if navigating backward and multiple blocks are selected', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Fourteen' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Seven' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Eleven' }],
      },
    ]
    const structure = [
      {
        type: 'headline',
      },
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    const editor = await setup(structure)
    await Transforms.select(editor, {
      anchor: { path: [2, 0], offset: 2 },
      focus: { path: [1, 0], offset: 4 },
    })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 8 })
  })

  it('should still work after inserts/converts/normalisation', async () => {
    value = [
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
        type: ['paragraph', 'blockQuote', 'ul', 'ol', 'figure'],
        repeat: true,
      },
    ]
    await setup(structure)
    expect(cleanupTree(value)).toEqual([
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
