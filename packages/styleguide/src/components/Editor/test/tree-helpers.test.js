import { cleanupTree } from '../Core/helpers/tree'

describe('Slate Editor', () => {
  describe('cleanupTree()', () => {
    it('should remove attributes only relevant to working tree', async () => {
      const value = [
        {
          children: [
            {
              placeholder: 'Headline',
              template: {
                repeat: true,
                type: ['text'],
              },
              text: 'Hello',
            },
          ],
          template: {
            type: 'headline',
          },
          type: 'headline',
        },
        {
          children: [
            {
              placeholder: 'Paragraph',
              template: {
                repeat: true,
                type: ['text', 'link', 'break', 'inlineCode'],
              },
              text: 'World',
              bold: true,
            },
          ],
          template: {
            repeat: true,
            type: ['paragraph', 'blockQuote', 'ul', 'ol'],
          },
          type: 'paragraph',
        },
      ]
      expect(cleanupTree(value)).toEqual([
        {
          children: [
            {
              text: 'Hello',
            },
          ],
          type: 'headline',
        },
        {
          children: [
            {
              text: 'World',
              bold: true,
            },
          ],
          type: 'paragraph',
        },
      ])
    })

    it('should not remove custom attributes', async () => {
      const value = [
        {
          children: [
            {
              children: [
                {
                  text: 'Lorem ipsum',
                },
              ],
              type: 'listItem',
            },
          ],
          type: 'ul',
          ordered: false,
        },
      ]
      expect(cleanupTree(value)).toEqual(value)
    })

    it('should optionally delete empty text nodes', async () => {
      const value = [
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
                { text: '', end: true },
              ],
            },
          ],
        },
        {
          type: 'break',
          children: [{ text: '' }],
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
                { text: 'Man with fruit.' },
                { type: 'figureByline', children: [{ text: '' }] },
                { text: '', end: true },
              ],
            },
          ],
        },
      ]
      expect(cleanupTree(value, true)).toEqual([
        {
          type: 'break',
          children: [{ text: '' }],
        },
        {
          type: 'figure',
          children: [
            {
              type: 'figureCaption',
              children: [{ text: 'Man with fruit.' }],
            },
          ],
        },
      ])
    })

    it('should delete empty nested nodes', async () => {
      const value = [
        {
          type: 'flyerTileOpening',
          children: [
            {
              type: 'headline',
              children: [
                {
                  text: 'Bonjour Madame!',
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
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              type: 'flyerPunchline',
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
        },
      ]
      expect(cleanupTree(value, true)).toEqual([
        {
          type: 'flyerTileOpening',
          children: [
            {
              type: 'headline',
              children: [
                {
                  text: 'Bonjour Madame!',
                },
              ],
            },
          ],
        },
      ])
    })
  })
})
