import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { cleanupTree } from '../editor/helpers/tree'
import { toggleElement } from '../editor/helpers/structure'

describe('Slate Editor: Block Conversion', () => {
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

  it('should convert empty simple block types (P) to empty complex types (Quote, List) and back', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'blockQuote', 'ul', 'ol'],
      },
    ]
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0], offset: 0 })

    toggleElement(editor, 'blockQuote')
    await new Promise(process.nextTick)
    expect(value.length).toBe(1)
    expect(value[0].type).toBe('blockQuote')

    toggleElement(editor, 'ul')
    await new Promise(process.nextTick)
    expect(value.length).toBe(1)
    expect(value[0].type).toBe('ul')

    toggleElement(editor, 'ol')
    await new Promise(process.nextTick)
    expect(value.length).toBe(1)
    expect(value[0].type).toBe('ol')

    toggleElement(editor, 'ul')
    await new Promise(process.nextTick)
    expect(value.length).toBe(1)
    expect(value[0].type).toBe('ul')

    toggleElement(editor, 'blockQuote')
    await new Promise(process.nextTick)
    expect(value.length).toBe(1)
    expect(value[0].type).toBe('blockQuote')

    toggleElement(editor, 'paragraph')
    await new Promise(process.nextTick)
    expect(value.length).toBe(1)
    expect(value[0].type).toBe('paragraph')
  })

  it('should preserve formatting/links during conversion', async () => {
    const formattedText = [
      { text: 'CO' },
      { text: '2', sub: true },
      { text: 'levels are ' },
      {
        type: 'link',
        href: 'https://www.republik.ch',
        children: [{ text: 'increasing' }],
      },
      { text: '' },
    ]
    value = [
      {
        type: 'paragraph',
        children: JSON.parse(JSON.stringify(formattedText)),
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'blockQuote', 'ul', 'ol'],
      },
    ]
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0], offset: 0 })

    toggleElement(editor, 'blockQuote')
    await new Promise(process.nextTick)
    expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

    toggleElement(editor, 'ul')
    await new Promise(process.nextTick)
    expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

    toggleElement(editor, 'ol')
    await new Promise(process.nextTick)
    expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

    toggleElement(editor, 'paragraph')
    await new Promise(process.nextTick)
    expect(cleanupTree(value[0].children)).toEqual(formattedText)
  })

  it('should convert paragraph where selection is', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: 'One' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Two' }],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'blockQuote', 'ul', 'ol'],
        repeat: true,
      },
    ]
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [1, 0], offset: 0 })

    toggleElement(editor, 'ol')
    await new Promise(process.nextTick)
    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'One' }],
      },
      {
        type: 'ol',
        ordered: true,
        children: [
          {
            type: 'listItem',
            children: [{ text: 'Two' }],
          },
        ],
      },
    ])
    expect(editor.selection.focus.path).toEqual([1, 0, 0])
  })

  it('should convert multiple nested elements and move cursor to the last main (nested) element', async () => {
    value = [
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
        type: ['paragraph', 'blockQuote', 'ul', 'ol'],
        repeat: true,
      },
    ]
    const editor = await setup(structure)
    await Transforms.select(editor, { path: [0, 0], offset: 0 })

    toggleElement(editor, 'blockQuote')
    await new Promise(process.nextTick)
    expect(cleanupTree(value)).toEqual([
      {
        type: 'blockQuote',
        ordered: false, // TODO: get rid of props propagation
        children: [
          {
            type: 'blockQuoteText',
            children: [{ text: 'One' }],
          },
          {
            type: 'blockQuoteText',
            children: [{ text: 'Two' }],
          },
          {
            type: 'figureCaption',
            children: [
              { text: '' },
              { type: 'figureByline', children: [{ text: '' }] },
              { text: '' },
            ],
          },
        ],
      },
    ])
    expect(editor.selection.focus.path).toEqual([0, 1, 0])

    await Transforms.select(editor, [0, 0, 0])
    toggleElement(editor, 'ol')
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
            children: [{ text: 'Two' }],
          },
        ],
      },
    ])
    expect(editor.selection.focus.path).toEqual([0, 1, 0])

    await Transforms.select(editor, [0, 0])
    toggleElement(editor, 'paragraph')
    await new Promise(process.nextTick)
    expect(cleanupTree(value)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'One' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Two' }],
      },
    ])
    expect(editor.selection.focus.path).toEqual([1, 0])
  })
})
