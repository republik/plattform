import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { cleanupTree } from '../editor/helpers/tree'
import { insertRepeat } from '../editor/helpers/structure'

describe('Slate Editor: Block Insertion (On Enter)', () => {
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0], offset: 5 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 2], offset: 22 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0], offset: 5 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0], offset: 5 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0], offset: 10 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
    const editor = await setup(structure)
    await Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 10 },
    })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
    const editor = await setup(structure)
    await Transforms.select(editor, {
      focus: { path: [0, 0], offset: 5 },
      anchor: { path: [1, 0], offset: 6 },
    })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 1, 1, 0], offset: 6 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
        ordered: false,
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0, 0], offset: 3 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
    expect(cleanupTree(value)).toEqual([
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
            children: [{ text: '' }],
          },
        ],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [0, 1, 0], offset: 0 })
  })

  it('should delete last repeated element if it is empty and fallback on adjacent node if it makes sense', async () => {
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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

  it('should delete last repeated element if it is empty and create the new repeated node if it makes sense', async () => {
    value = [
      {
        type: 'ol',
        ordered: true,
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
    expect(cleanupTree(value)).toEqual([
      {
        type: 'ol',
        ordered: true,
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

  it('should not exit nested repeatable structure if current block is not the last element', async () => {
    value = [
      {
        type: 'ol',
        ordered: true,
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
    expect(cleanupTree(value)).toEqual([
      {
        type: 'ol',
        ordered: true,
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
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 1, 0], offset: 4 })
    insertRepeat(editor)
    await new Promise(process.nextTick)
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
                children: [{ text: 'lands on a branch' }],
              },
              { text: '' },
            ],
          },
        ],
      },
    ])
    expect(editor.selection.focus).toEqual({ path: [0, 1, 1, 0], offset: 0 })
  })

  it('should set cursor to the newly created element even if the cursor in an end node', async () => {
    // TODO: bug fix
  })
})
