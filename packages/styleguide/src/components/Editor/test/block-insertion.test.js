import { createEditor, Transforms } from 'slate'
import { cleanupTree } from '../Core/helpers/tree'
import { insertRepeat } from '../Core/helpers/structure'
import schema from '../schema/article'
import flyerSchema from '../schema/flyer'
import mockEditor from './mockEditor'
import { figure, flyerTile, flyerTileMeta, paragraph } from './blocks'
import { act } from '@testing-library/react'

describe('Slate Editor: Block Insertion (On Enter)', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(config) {
    return act(
      async () =>
        await mockEditor(createEditor(), {
          config,
          value,
          setValue: (val) => (value = val),
        }),
    )
  }

  it('should create a new element of the same type if possible (repeatable)', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: 'Hello' }],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 0], offset: 5 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Hello' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should split the element in two if cursor is somewhere in the middle (and preserve formatting)', async () => {
    value = [
      {
        type: 'paragraph',
        children: [
          { text: 'CO' },
          { text: '2', sub: true },
          { text: 'levels are increasing:' },
          {
            type: 'link',
            href: 'https://www.republik.ch',
            children: [{ text: 'report', italic: true }],
          },
          { text: ' here', bold: true },
        ],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 2], offset: 22 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'CO' },
          { text: '2', sub: true },
          { text: 'levels are increasing:' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'link',
            href: 'https://www.republik.ch',
            children: [{ text: 'report', italic: true }],
          },
          { text: ' here', bold: true },
        ],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should split inline nodes gracefully', async () => {
    value = [
      {
        type: 'paragraph',
        children: [
          { text: 'my ' },
          {
            type: 'link',
            href: 'https://www.republik.ch',
            children: [{ text: 'blowfish' }],
          },
          { text: ' glows' },
        ],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 1, 0], offset: 4 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'my ' },
          {
            type: 'link',
            href: 'https://www.republik.ch',
            children: [{ text: 'blow' }],
          },
          {
            text: '',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'link',
            href: 'https://www.republik.ch',
            children: [{ text: 'fish' }],
          },
          { text: ' glows' },
        ],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 1, 0], offset: 0 })
  })

  it('should handle no-next-move-possible scenario', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: 'Hello' }],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 0], offset: 5 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Hello' }],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 5 })
  })

  it('should fallback on next repeatable element', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Hello' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'World' }],
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
      await Transforms.select(editor, { path: [0, 0], offset: 5 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'headline',
        children: [{ text: 'Hello' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'World' }],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should split the element in two and fallback if cursor is somewhere in a non-repeatable element', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Report on CO' }, { text: '2', sub: true }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Read it now.' }],
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
      await Transforms.select(editor, { path: [0, 0], offset: 10 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'headline',
        children: [{ text: 'Report on ' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'CO' }, { text: '2', sub: true }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Read it now.' }],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should erase the portion of text that is selected and collapse selection', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Report on CO' }, { text: '2', sub: true }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Read it now.' }],
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
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 10 },
      })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'headline',
        children: [{ text: 'Report' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'CO' }, { text: '2', sub: true }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Read it now.' }],
      },
    ])
    expect(editor.selection.anchor).toEqual(editor.selection.focus)
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should delete selected text and insert element at the end of the range if multiple blocks are selected', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Hello World' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Hello World' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Lorem ipsum' }],
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
        focus: { path: [0, 0], offset: 5 },
        anchor: { path: [1, 0], offset: 6 },
      })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'headline',
        children: [{ text: 'Hello' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'World' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Lorem ipsum' }],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should fallback successfully on next repeatable element from within nested structure', async () => {
    value = [
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
              {
                type: 'figureByline',
                children: [{ text: 'lands on a branch' }],
              },
              { text: '' },
            ],
          },
        ],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'figure'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 1, 1, 0], offset: 6 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
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
              {
                type: 'figureByline',
                children: [{ text: 'lands ' }],
              },
              { text: '' },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: 'on a branch' }],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should create new nested repeatable blocks if we are inside a nested repeatable structure', async () => {
    value = [
      {
        type: 'ul',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
        ],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'ul'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 0, 0], offset: 3 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'ul',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
          {
            type: 'listItem',
            children: [{ text: '' }],
          },
        ],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [0, 1, 0], offset: 0 })
  })

  it('should delete last repeated element if it is empty and fallback on adjacent node', async () => {
    value = [
      {
        type: 'blockQuote',
        children: [
          {
            type: 'blockQuoteText',
            children: [{ text: 'Stately, plump Buck Mulligan...' }],
          },
          {
            type: 'blockQuoteText',
            children: [{ text: '' }],
          },
          {
            type: 'figureCaption',
            children: [
              { text: 'Ulysses' },
              { type: 'figureByline', children: [{ text: 'Jame Joyce' }] },
              { text: '' },
            ],
          },
        ],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'blockQuote'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'blockQuote',
        children: [
          {
            type: 'blockQuoteText',
            children: [{ text: 'Stately, plump Buck Mulligan...' }],
          },
          {
            type: 'figureCaption',
            children: [
              { text: 'Ulysses' },
              { type: 'figureByline', children: [{ text: 'Jame Joyce' }] },
              { text: '' },
            ],
          },
        ],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [0, 1, 0], offset: 0 })
  })

  it('should delete last repeated element if it is empty and create the new repeated node', async () => {
    value = [
      {
        type: 'ol',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
          {
            type: 'listItem',
            children: [{ text: '' }],
          },
        ],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'ol'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'ol',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should delete last nested repeated element if it is empty and fallback on adjacent non-repeatable node', async () => {
    value = [
      {
        type: 'flyerTileMeta',
        id: '123',
        children: [
          {
            type: 'flyerMetaP',
            children: [
              {
                text: '',
              },
            ],
          },
          {
            type: 'flyerMetaP',
            children: [
              {
                text: '',
              },
            ],
          },
        ],
      },
      flyerTile,
    ]
    const structure = [
      {
        type: 'flyerTileMeta',
      },
      {
        type: 'flyerTile',
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, [0, 1, 0])
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toMatchObject([flyerTileMeta, flyerTile])
    expect(editor.selection.focus.path).toEqual([1, 0, 0])
  })

  it('should delete last nested repeated element if it is empty and create an adjacent repeatable node', async () => {
    value = [
      {
        type: 'flyerTileMeta',
        id: '123',
        children: [
          {
            type: 'flyerMetaP',
            children: [
              {
                text: '',
              },
            ],
          },
          {
            type: 'flyerMetaP',
            children: [
              {
                text: '',
              },
            ],
          },
        ],
      },
      flyerTile,
    ]
    const structure = [
      {
        type: 'flyerTileMeta',
      },
      {
        type: 'flyerTile',
        repeat: true,
      },
    ]
    const editor = await act(async () =>
      setup({ schema: flyerSchema, structure }),
    )
    await act(async () => {
      await Transforms.select(editor, [0, 1, 0])
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toMatchObject([
      flyerTileMeta,
      flyerTile,
      flyerTile,
    ])
    expect(editor.selection.focus.path).toEqual([1, 0, 0])
  })

  it('should not exit nested repeatable structure if current block is not the last element', async () => {
    value = [
      {
        type: 'ol',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
          {
            type: 'listItem',
            children: [{ text: '' }],
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
        type: ['paragraph', 'ol'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([
      {
        type: 'ol',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
          {
            type: 'listItem',
            children: [{ text: '' }],
          },
          {
            type: 'listItem',
            children: [{ text: '' }],
          },
          {
            type: 'listItem',
            children: [{ text: 'Two' }],
          },
        ],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [0, 2, 0], offset: 0 })
  })

  it('should navigate to the next element if neither the current nor the next element are repeatable', async () => {
    value = [figure]
    const structure = [
      {
        type: ['paragraph', 'figure'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      // select figure caption
      await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([figure])
    // jump to figure byline
    expect(editor.selection.focus.path).toEqual([0, 1, 1, 0])
  })

  it('should set cursor to the newly created element even if the cursor in an end node', async () => {
    value = [figure]
    const structure = [
      {
        type: ['paragraph', 'figure'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await act(async () => {
      await Transforms.select(editor, { path: [0, 1, 2], offset: 0 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)).toEqual([figure, paragraph])
    expect(editor.selection.focus).toEqual({ path: [1, 0], offset: 0 })
  })

  it('should generate default props as specified', async () => {
    value = [flyerTile]
    const structure = [
      {
        type: 'flyerTile',
        repeat: true,
      },
    ]
    const editor = await act(async () =>
      setup({ schema: flyerSchema, structure }),
    )
    await act(async () => {
      await Transforms.select(editor, { path: [0, 5, 0], offset: 0 })
      await insertRepeat(editor)
    })
    expect(cleanupTree(value)[1].id).toBeDefined()
  })
})
