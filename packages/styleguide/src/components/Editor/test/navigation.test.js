import { createEditor, Transforms } from 'slate'
import { selectAdjacent } from '../Core/helpers/tree'
import { toggleElement, insertRepeat } from '../Core/helpers/structure'
import schema from '../schema/article'
import mockEditor from './mockEditor'
import { act } from '@testing-library/react'

describe('Slate Editor: Navigation (On Tab)', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(config) {
    return act(async () =>
      mockEditor(createEditor(), {
        config,
        value,
        setValue: (val) => (value = val),
      }),
    )
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
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () =>
      Transforms.select(editor, {
        path: [0, 0],
        offset: 3,
      }),
    )

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [1, 0, 0], offset: 0 })

    // forward tab nav
    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [1, 1, 0], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [1, 1, 1, 0], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [2, 1], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [2, 3], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [2, 4, 0], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [2, 5], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [3, 0, 0], offset: 0 })

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [3, 1, 0], offset: 0 })

    // we cannot go any further
    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus).toEqual({ path: [3, 1, 0], offset: 0 })

    // backward tab nav
    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [3, 0, 0], offset: 3 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [2, 5], offset: 0 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [2, 4, 0], offset: 11 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [2, 3], offset: 11 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [2, 1], offset: 1 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 2 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [1, 1, 1, 0], offset: 8 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [1, 1, 0], offset: 11 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [1, 0, 0], offset: 0 })

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 11 })

    // we cannot go any further
    await act(async () => selectAdjacent(editor, 'previous'))
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
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 2 },
        focus: { path: [0, 0], offset: 4 },
      })
      await selectAdjacent(editor, 'next')
    })

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
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, {
        anchor: { path: [2, 0], offset: 2 },
        focus: { path: [1, 0], offset: 4 },
      })

      await selectAdjacent(editor, 'previous')
    })
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
        type: ['paragraph', 'figure', 'ul'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })

    await act(async () => {
      // build tree
      await Transforms.select(editor, [0, 0])
      await insertRepeat(editor)

      await toggleElement(editor, 'figure')

      await Transforms.select(editor, [1, 1, 1, 0])
      await insertRepeat(editor)

      await insertRepeat(editor)

      await Transforms.select(editor, [3])
      await toggleElement(editor, 'ul')

      await Transforms.select(editor, [0])

      await selectAdjacent(editor, 'next')
    })
    expect(editor.selection.focus.path).toEqual([1, 0, 0])

    // forward tab nav
    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus.path).toEqual([1, 1, 0])

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus.path).toEqual([1, 1, 1, 0])

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus.path).toEqual([2, 0])

    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus.path).toEqual([3, 0, 0])

    // we cannot go any further
    await act(async () => selectAdjacent(editor, 'next'))
    expect(editor.selection.focus.path).toEqual([3, 0, 0])

    // backward tab nav
    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus.path).toEqual([2, 0])

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus.path).toEqual([1, 1, 1, 0])

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus.path).toEqual([1, 1, 0])

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus.path).toEqual([1, 0, 0])

    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus.path).toEqual([0, 0])

    // we cannot go any further
    await act(async () => selectAdjacent(editor, 'previous'))
    expect(editor.selection.focus.path).toEqual([0, 0])
  })
})
