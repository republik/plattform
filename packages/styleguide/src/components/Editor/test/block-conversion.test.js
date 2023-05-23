import { createEditor, Transforms } from 'slate'
import { act } from '@testing-library/react'
import { cleanupTree } from '../Core/helpers/tree'
import { toggleElement } from '../Core/helpers/structure'
import mockEditor from './mockEditor'
import articleSchema from '../schema/article'
import flyerSchema from '../schema/flyer'
import { figure, pullQuote } from './blocks'

describe('Slate Editor: Block Conversion', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema: articleSchema }

  async function setup(config) {
    return act(async () =>
      mockEditor(createEditor(), {
        config,
        value,
        setValue: (val) => (value = val),
      }),
    )
  }

  describe('simple conversion', () => {
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

      const editor = await setup({ ...defaultConfig, structure })

      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 0 })
        toggleElement(editor, 'blockQuote')
      })
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('blockQuote')

      await act(async () => {
        toggleElement(editor, 'ul')
      })
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('ul')

      await act(async () => {
        toggleElement(editor, 'ol')
      })
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('ol')

      await act(async () => {
        toggleElement(editor, 'ul')
      })
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('ul')

      await act(async () => {
        toggleElement(editor, 'blockQuote')
      })
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('blockQuote')

      await act(async () => {
        toggleElement(editor, 'paragraph')
      })
      expect(value.length).toBe(1)
      expect(value[0].type).toBe('paragraph')
    })

    it('should preserve formatting/links during conversion but remove illegal inlines', async () => {
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
          type: ['paragraph', 'pullQuote', 'ul', 'ol'],
        },
      ]

      const editor = await setup({ ...defaultConfig, structure })

      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 0 })
        toggleElement(editor, 'ul')
      })
      expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

      await act(async () => {
        toggleElement(editor, 'ol')
      })
      expect(cleanupTree(value[0].children[0].children)).toEqual(formattedText)

      await act(async () => {
        toggleElement(editor, 'pullQuote')
      })
      expect(cleanupTree(value[0].children[0].children)).toEqual([
        { text: 'CO' },
        { text: '2', sub: true },
        { text: 'levels are increasing' },
      ])

      await act(async () => {
        toggleElement(editor, 'paragraph')
      })
      expect(cleanupTree(value[0].children)).toEqual([
        { text: 'CO' },
        { text: '2', sub: true },
        { text: 'levels are increasing' },
      ])
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

      const editor = await setup({ ...defaultConfig, structure })

      await act(async () => {
        await Transforms.select(editor, { path: [1, 0], offset: 0 })
        toggleElement(editor, 'ol')
      })
      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'One' }],
        },
        {
          type: 'ol',
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
      const editor = await setup({ ...defaultConfig, structure })

      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 0 })
        toggleElement(editor, 'blockQuote')
      })
      expect(cleanupTree(value)).toEqual([
        {
          type: 'blockQuote',
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

      await act(async () => {
        await Transforms.select(editor, [0, 0, 0])
        toggleElement(editor, 'ol')
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
              children: [{ text: 'Two' }],
            },
          ],
        },
      ])
      expect(editor.selection.focus.path).toEqual([0, 1, 0])

      await act(async () => {
        await Transforms.select(editor, [0, 0])
        toggleElement(editor, 'paragraph')
      })
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

  describe('nested conversion', () => {
    it('should convert nested elements (e.g. within tile) successfully', async () => {
      value = [
        {
          type: 'flyerTile',
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
              type: 'flyerTopic',
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              type: 'flyerTitle',
              children: [
                {
                  text: 'Hitzewelle werden mit Strand- und Badebilder illustriert! Wieso?',
                },
              ],
            },
            {
              type: 'flyerAuthor',
              authorId: '123',
              children: [{ text: '' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Lorem ipsum.',
                },
              ],
            },
            {
              type: 'flyerPunchline',
              children: [{ text: '' }],
            },
          ],
        },
      ]
      const structure = [
        {
          type: ['flyerTile', 'flyerTileMeta'],
          repeat: true,
        },
      ]
      const editor = await act(async () => {
        return setup({ schema: flyerSchema, structure })
      })

      // toggle inner tile elements
      await act(async () => {
        await Transforms.select(editor, [0, 4, 0])
        toggleElement(editor, 'ul')
      })
      expect(cleanupTree(value)[0].children[4]).toEqual({
        type: 'ul',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'Lorem ipsum.' }],
          },
        ],
      })

      // toggle inner tile elements
      await act(async () => {
        await Transforms.select(editor, [0, 5, 0])
        toggleElement(editor, 'figure')
      })
      expect(cleanupTree(value)[0].children[5]).toEqual(figure)

      await act(async () => {
        toggleElement(editor, 'pullQuote')
      })
      expect(cleanupTree(value)[0].children[5]).toEqual(pullQuote)

      await act(async () => {
        toggleElement(editor, 'figure')
      })
      expect(cleanupTree(value)[0].children[5]).toEqual(figure)

      // toggle tile type
      await act(async () => {
        await Transforms.select(editor, [0, 0, 0])
        toggleElement(editor, 'flyerTileMeta')
      })
      expect(cleanupTree(value)).toMatchObject([
        {
          type: 'flyerTileMeta',
          children: [
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
      ])
    })

    it('should convert quiz into preview with success', async () => {
      value = [
        {
          type: 'quiz',
          children: [
            {
              type: 'quizItem',
              isCorrect: true,
              children: [
                {
                  type: 'quizAnswer',
                  children: [
                    {
                      text: 'Answer 1',
                    },
                  ],
                },
                {
                  type: 'quizAnswerInfo',
                  children: [
                    {
                      type: 'quizAnswerInfoP',
                      children: [
                        {
                          text: 'Info to first answer',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'quizItem',
              children: [
                {
                  type: 'quizAnswer',
                  children: [
                    {
                      text: 'Answer 2',
                    },
                  ],
                },
                {
                  type: 'quizAnswerInfo',
                  children: [
                    {
                      type: 'quizAnswerInfoP',
                      children: [
                        {
                          text: 'Wrong!',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'quizItem',
              children: [
                {
                  type: 'quizAnswer',
                  children: [
                    {
                      text: 'Answer 3',
                    },
                  ],
                },
                {
                  type: 'quizAnswerInfo',
                  children: [
                    {
                      type: 'quizAnswerInfoP',
                      children: [
                        {
                          text: 'Also wrong…',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]
      const structure = [
        {
          type: ['quiz', 'articlePreview'],
          repeat: true,
        },
      ]
      const editor = await act(async () => {
        return setup({ schema: flyerSchema, structure })
      })

      // toggle inner tile elements
      await act(async () => {
        await Transforms.select(editor, [0, 1, 1, 0])
        toggleElement(editor, 'articlePreview')
      })
      expect(cleanupTree(value)).toEqual([
        {
          children: [
            { children: [{ text: '' }], type: 'figureImage' },
            {
              children: [
                {
                  children: [{ text: 'Answer 1' }],
                  type: 'articlePreviewFormat',
                },
                {
                  children: [{ text: 'Info to first answer' }],
                  type: 'articlePreviewTitle',
                },
                { children: [{ text: '' }], type: 'articlePreviewLead' },
              ],
              type: 'articlePreviewTextContainer',
            },
          ],
          type: 'articlePreview',
        },
      ])
    })
  })
})
