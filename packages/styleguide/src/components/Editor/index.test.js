import React from 'react'
import Editor from './components/editor/index'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { cleanup, fireEvent, getByTestId } from '@testing-library/react'
import { cleanupTree } from './components/editor/helpers/tree'
import { insertElement } from './components/editor/helpers/structure'
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

  it('should normalise the initial value according to structure', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]
    await setup()
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

  describe('Block Buttons (Block Type Conversion)', () => {
    it('should highlight selected block type', async () => {})
    it('should disable "impossible" block types (according to structure)', async () => {})
    it('should be disabled if editor is deselected', async () => {})
    it('should be disabled if many blocks are selected at once', async () => {})

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

      insertElement(editor, 'blockQuote')
      await new Promise(process.nextTick)
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('blockQuote')

      insertElement(editor, 'ul')
      await new Promise(process.nextTick)
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('ul')

      insertElement(editor, 'ol')
      await new Promise(process.nextTick)
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('ol')

      insertElement(editor, 'ul')
      await new Promise(process.nextTick)
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('ul')

      insertElement(editor, 'blockQuote')
      await new Promise(process.nextTick)
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('blockQuote')

      insertElement(editor, 'paragraph')
      await new Promise(process.nextTick)
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('paragraph')
    })
    it('should preserve formatting/links during conversion', async () => {
      const formattedText = [
        { text: 'CO' },
        { text: '2', sup: true },
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

      insertElement(editor, 'blockQuote')
      await new Promise(process.nextTick)
      expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

      insertElement(editor, 'ul')
      await new Promise(process.nextTick)
      expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

      insertElement(editor, 'ol')
      await new Promise(process.nextTick)
      expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

      insertElement(editor, 'paragraph')
      await new Promise(process.nextTick)
      expect(cleanupTree(value[0].children)).toEqual(formattedText)
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
        },
      ]
      const editor = await setup(structure)
      await Transforms.select(editor, { path: [0, 0], offset: 0 })

      insertElement(editor, 'blockQuote')
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
      insertElement(editor, 'ol')
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
      insertElement(editor, 'paragraph')
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

  describe('Normalisation', () => {
    describe('fixStructure()', () => {
      it('should insert missing nodes at the end of the tree', async () => {
        value = [
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
          },
        ]
        const structure = [
          {
            type: 'headline',
          },
          {
            type: 'figure',
          },
          {
            type: ['paragraph', 'blockQuote'],
            repeat: true,
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
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
                  { text: '' },
                  { type: 'figureByline', children: [{ text: '' }] },
                  { text: '' },
                ],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ])
      })
      it('should insert missing node in the middle of the tree (without erasing subsequent ones)', async () => {
        value = [
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
          },
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
        ]
        const structure = [
          {
            type: 'headline',
          },
          {
            type: 'figure',
          },
          {
            type: ['paragraph', 'blockQuote'],
            repeat: true,
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
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
                  { text: '' },
                  { type: 'figureByline', children: [{ text: '' }] },
                  { text: '' },
                ],
              },
            ],
          },
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
      })
      it('should delete illegal node at the end of the tree', async () => {
        value = [
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Once upon a time' }],
          },
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
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Once upon a time' }],
          },
        ])
      })
      it('should delete illegal repeat nodes at the end of the tree', async () => {
        value = [
          {
            type: 'paragraph',
            children: [{ text: 'Once upon a time' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'In a faraway land' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Lived a bearded bard' }],
          },
        ]
        const structure = [
          {
            type: 'paragraph',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'paragraph',
            children: [{ text: 'Once upon a time' }],
          },
        ])
      })
      it('should delete illegal node in the middle of the tree', async () => {
        value = [
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Once upon a time' }],
          },
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
        ]
        const structure = [
          {
            type: 'headline',
          },
          {
            type: 'blockQuote',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
          },
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
      })
      it('should not delete legal repeated nodes', async () => {
        value = [
          {
            type: 'headline',
            children: [{ text: 'Hello' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Once upon a time' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'In a faraway land' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Lived a bearded bard' }],
          },
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
        ]
        const initialValue = JSON.parse(JSON.stringify(value))
        const structure = [
          {
            type: 'headline',
          },
          {
            type: 'paragraph',
            repeat: true,
          },
          {
            type: 'blockQuote',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual(initialValue)
      })
      it('should delete parent when main child node was deleted by user', async () => {
        value = [
          {
            type: 'blockQuote',
            children: [
              {
                type: 'blockQuoteText',
                children: [{ text: 'Stately, plump Buck Mulligan' }],
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
          {
            type: 'paragraph',
            children: [{ text: 'Hello world' }],
          },
        ]
        const structure = [
          {
            type: ['paragraph', 'blockQuote'],
            repeat: true,
          },
        ]
        const editor = await setup(structure)
        await editor.apply({
          type: 'remove_node',
          path: [0, 0],
          node: {
            type: 'blockQuoteText',
            children: [{ text: 'Stately, plump Buck Mulligan' }],
          },
        })
        expect(cleanupTree(value)).toEqual([
          {
            type: 'paragraph',
            children: [{ text: 'Hello world' }],
          },
        ])
      })
      it('should insert main child node if missing (not deleted by user)', async () => {
        value = [
          {
            type: 'blockQuote',
            children: [
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
            type: 'blockQuote',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'blockQuote',
            children: [
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
        ])
      })
      it('should link appropriate templates', async () => {
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
            type: ['paragraph', 'blockQuote'],
            repeat: true,
          },
        ]
        await setup(structure)
        expect(value.length).toBe(2)
        expect(value[0].template).toEqual({
          type: 'headline',
        })
        expect(value[1].template).toEqual({
          type: ['paragraph', 'blockQuote'],
          repeat: true,
        })
      })
      it('should mark end nodes as end if appropriate', async () => {
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
                  { text: '' },
                  { type: 'figureByline', children: [{ text: '' }] },
                  { text: '' },
                ],
              },
            ],
          },
        ]
        const structure = [
          {
            type: 'figure',
          },
        ]
        await setup(structure)
        expect(value[0].children[1].children[0].end).toBe(undefined)
        expect(value[0].children[1].children[1].children[0].end).toBe(undefined)
        expect(value[0].children[1].children[2].end).toBe(true)
      })
      it('should delete mismatched nested nodes but keep content when possible', async () => {
        value = [
          {
            type: 'paragraph',
            children: [
              {
                type: 'blockQuoteText',
                children: [{ text: 'Stately, plump Buck Mulligan' }],
              },
              {
                type: 'figureCaption',
                children: [
                  { text: 'Ulysses' },
                  { type: 'figureByline', children: [{ text: 'Jame' }] },
                  { text: ' Joyce' },
                ],
              },
            ],
          },
        ]
        const structure = [
          {
            type: 'paragraph',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'paragraph',
            children: [{ text: 'Stately, plump Buck Mulligan' }],
          },
        ])
      })
    })

    describe('handleEnds()', () => {
      it('should move text inputed after the end node back in the end node', async () => {
        value = [
          {
            type: 'blockQuote',
            children: [
              {
                type: 'blockQuoteText',
                children: [{ text: 'Stately, plump Buck Mulligan' }],
              },
              {
                type: 'figureCaption',
                children: [
                  { text: 'Ulysses' },
                  { type: 'figureByline', children: [{ text: 'Jame' }] },
                  { text: ' Joyce' },
                ],
              },
            ],
          },
        ]
        const structure = [
          {
            type: 'blockQuote',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'blockQuote',
            children: [
              {
                type: 'blockQuoteText',
                children: [{ text: 'Stately, plump Buck Mulligan' }],
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
      })
    })

    describe('createLinks()', () => {
      it('should autolink links in text – http...', async () => {
        value = [
          {
            type: 'paragraph',
            children: [
              { text: 'Read the rest of the story on https://www.republik.ch' },
            ],
          },
        ]
        const structure = [
          {
            type: 'paragraph',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'paragraph',
            children: [
              { text: 'Read the rest of the story on ' },
              {
                type: 'link',
                href: 'https://www.republik.ch',
                children: [{ text: 'https://www.republik.ch' }],
              },
              { text: '' },
            ],
          },
        ])
      })
      it('should autolink links in text – wwww...', async () => {
        value = [
          {
            type: 'paragraph',
            children: [
              { text: 'Read the rest of the story on www.republik.ch' },
            ],
          },
        ]
        const structure = [
          {
            type: 'paragraph',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'paragraph',
            children: [
              { text: 'Read the rest of the story on ' },
              {
                type: 'link',
                href: 'http://www.republik.ch',
                children: [{ text: 'www.republik.ch' }],
              },
              { text: '' },
            ],
          },
        ])
      })
    })

    describe('handlePlaceholders()', () => {
      it('should add placeholders on single empty text node', async () => {
        value = [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ]
        const structure = [
          {
            type: 'paragraph',
          },
        ]
        await setup(structure)
        expect(value[0].children[0].placeholder).toEqual('Paragraph  ')
      })
      it('should not add placeholder on empty text node followed or preceded by another of equal status (same place in structure)', async () => {
        value = [
          {
            type: 'paragraph',
            children: [
              { text: '' },
              {
                type: 'link',
                href: 'http://www.republik.ch',
                children: [{ text: 'www.republik.ch' }],
              },
              { text: '' },
            ],
          },
        ]
        const structure = [
          {
            type: 'paragraph',
          },
        ]
        await setup(structure)
        expect(value[0].children[0].placeholder).toBe(undefined)
        expect(value[0].children[2].placeholder).toBe(undefined)
      })
      it('should add placeholder on empty text node followed or preceded by another of different status (other place in the structure)', async () => {
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
                  { text: '' },
                  { type: 'figureByline', children: [{ text: '' }] },
                  { text: '' },
                ],
              },
            ],
          },
        ]
        const structure = [
          {
            type: 'figure',
          },
        ]
        await setup(structure)
        expect(value[0].children[1].children[0].placeholder).toEqual(
          'Figure Caption  ',
        )
      })
      it('should not add placeholder on end node', async () => {
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
                  { text: '' },
                  { type: 'figureByline', children: [{ text: '' }] },
                  { text: '' },
                ],
              },
            ],
          },
        ]
        const structure = [
          {
            type: 'figure',
          },
        ]
        await setup(structure)
        expect(value[0].children[1].children[2].placeholder).toBe(undefined)
      })
      it('should not add placeholder on void node', async () => {
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
                  { text: '' },
                  { type: 'figureByline', children: [{ text: '' }] },
                  { text: '' },
                ],
              },
            ],
          },
        ]
        const structure = [
          {
            type: 'figure',
          },
        ]
        await setup(structure)
        expect(value[0].children[0].placeholder).toBe(undefined)
      })
    })

    describe('Custom', () => {
      it('should remove links with no text', async () => {
        value = [
          {
            type: 'paragraph',
            children: [
              { text: 'Read the rest of the story on ' },
              {
                type: 'link',
                href: 'http://www.republik.ch',
                children: [{ text: '' }],
              },
              { text: '' },
            ],
          },
        ]
        const structure = [
          {
            type: 'paragraph',
          },
        ]
        await setup(structure)
        expect(cleanupTree(value)).toEqual([
          {
            type: 'paragraph',
            children: [{ text: 'Read the rest of the story on ' }],
          },
        ])
      })
    })
  })
})
