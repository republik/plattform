import { createEditor, Transforms } from 'slate'
import { cleanupTree } from '../Core/helpers/tree'
import flyerSchema from '../schema/flyer'
import mockEditor from './mockEditor'
import { flyerTile } from './blocks'
import { insertSlateFragment } from '../Core/helpers/copy-paste'
import { act } from '@testing-library/react'

describe('Slate Editor: insert Slate fragment', () => {
  window.document.getSelection = jest.fn()

  let value

  async function setup(config) {
    return await mockEditor(createEditor(), {
      config,
      value,
      setValue: (val) => (value = val),
    })
  }

  describe('compatible block types', () => {
    it('should insert the fragment as is', async () => {
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
        await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })

        await insertSlateFragment(editor, [
          {
            type: 'flyerTile',
            children: [
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
                    text: 'Hello darkness',
                  },
                ],
              },
              {
                type: 'flyerAuthor',
                children: [{ text: '' }],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'My old friend.',
                  },
                ],
              },
            ],
          },
        ])
        await new Promise(process.nextTick)
      })
      expect(cleanupTree(value)).toEqual([
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
                  text: 'Hello darkness',
                },
              ],
            },
            {
              type: 'flyerAuthor',
              children: [{ text: '' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'My old friend.',
                },
              ],
            },
            {
              type: 'flyerPunchline',
              children: [{ text: '' }],
            },
          ],
        },
      ])
    })

    it('should insert the fragment as is if the type is compatible as per template', async () => {
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
        await insertSlateFragment(editor, [
          {
            type: 'flyerTile',
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Che tristezza, Nicoletta.',
                      },
                    ],
                    type: 'pullQuoteText',
                  },
                  {
                    children: [
                      {
                        text: 'Zum Beitrag: ',
                      },
                      {
                        children: [
                          {
                            text: 'Abschiednehmen',
                          },
                        ],
                        type: 'link',
                      },
                      {
                        text: '.',
                      },
                    ],
                    type: 'pullQuoteSource',
                  },
                ],
                type: 'pullQuote',
              },
            ],
          },
        ])
      })
      expect(cleanupTree(value)[0].children[5]).toEqual({
        children: [
          {
            children: [
              {
                text: 'Che tristezza, Nicoletta.',
              },
            ],
            type: 'pullQuoteText',
          },
          {
            children: [
              {
                text: 'Zum Beitrag: ',
              },
              {
                children: [
                  {
                    text: 'Abschiednehmen',
                  },
                ],
                type: 'link',
              },
              {
                text: '.',
              },
            ],
            type: 'pullQuoteSource',
          },
        ],
        type: 'pullQuote',
      })
    })
  })

  describe('convertible block types', () => {
    it('should convert the fragment and insert it', async () => {
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
        await Transforms.select(editor, { path: [0, 4, 0], offset: 0 })
        await insertSlateFragment(editor, [
          {
            type: 'flyerTile',
            children: [
              {
                type: 'flyerTopic',
                children: [
                  {
                    text: 'Hello darkness',
                  },
                ],
              },
              {
                type: 'flyerTitle',
                children: [
                  {
                    text: 'My old friend.',
                  },
                ],
              },
            ],
          },
        ])
      })
      expect(cleanupTree(value)).toEqual([
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
                  text: '',
                },
              ],
            },
            {
              type: 'flyerAuthor',
              children: [{ text: '' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Hello darkness',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'My old friend.',
                },
              ],
            },
            {
              type: 'flyerPunchline',
              children: [{ text: '' }],
            },
          ],
        },
      ])
    })
  })

  describe('imcompatible copied and selected block types', () => {
    it('should insert an inline version of the copied element', async () => {
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
        await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
        await insertSlateFragment(editor, [
          {
            type: 'flyerTile',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Hello',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'World',
                  },
                ],
              },
            ],
          },
        ])
      })
      expect(cleanupTree(value)[0].children[1]).toEqual({
        children: [
          {
            text: 'Hello World',
          },
        ],
        type: 'flyerTopic',
      })
    })
  })
})
