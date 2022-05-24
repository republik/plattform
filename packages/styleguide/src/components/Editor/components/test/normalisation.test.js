import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor } from 'slate'
import { cleanupTree } from '../editor/helpers/tree'
import schema from '../../schema/article'

describe('Slate Editor: Normalisation', () => {
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

  describe('fixStructure()', () => {
    it('should normalise the initial value according to structure', async () => {
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
          type: ['paragraph', 'blockQuote', 'ul', 'ol'],
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

    it('should unwrap incorrect inline node types', async () => {
      value = [
        {
          type: 'headline',
          children: [
            { text: 'Hello ' },
            { type: 'link', children: [{ text: 'my' }] },
            { text: ' dear' },
          ],
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
          type: ['paragraph'],
          repeat: true,
        },
      ]
      await setup(structure)
      expect(cleanupTree(value)).toEqual([
        {
          type: 'headline',
          children: [{ text: 'Hello my dear' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'World' }],
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

    it('should delete illegal inline node', async () => {
      value = [
        {
          type: 'headline',
          children: [
            { text: 'Hello' },
            { type: 'break', children: [{ text: '' }] },
            { text: 'World' },
          ],
        },
      ]
      const structure = [
        {
          type: 'headline',
        },
      ]
      await setup(structure)
      expect(cleanupTree(value)).toEqual([
        {
          type: 'headline',
          children: [{ text: 'HelloWorld' }],
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

    // TODO: this is not supported atm – needs some thinking... maybe support repeated end nodes?
    xit('should preserve overspill text if possible', async () => {
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
                { text: 'A picture' },
                { type: 'figureByline', children: [{ text: 'by an artist ' }] },
                { text: '', end: true },
                { text: 'whose name i forgot' },
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
                { text: 'A picture' },
                {
                  type: 'figureByline',
                  children: [{ text: 'by an artist whose name i forgot' }],
                },
                { text: '', end: true },
              ],
            },
          ],
        },
      ])
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

    it('formatting (except sub/sup) should be removed unless parent block has formatText flag in config', async () => {
      value = [
        {
          type: 'headline',
          children: [
            { text: 'CO' },
            { text: '2', sub: true },
            { text: 'levels are ' },
            { text: 'crazy', bold: true },
            { text: '!!!' },
          ],
        },
        {
          type: 'paragraph',
          children: [
            { text: 'CO' },
            { text: '2', sub: true },
            { text: 'levels are ' },
            { text: 'crazy', bold: true },
            { text: '!!!' },
          ],
        },
      ]
      const structure = [
        {
          type: 'headline',
        },
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)
      expect(cleanupTree(value)).toEqual([
        {
          type: 'headline',
          children: [
            { text: 'CO' },
            { text: '2', sub: true },
            { text: 'levels are crazy!!!' },
          ],
        },
        {
          type: 'paragraph',
          children: [
            { text: 'CO' },
            { text: '2', sub: true },
            { text: 'levels are ' },
            { text: 'crazy', bold: true },
            { text: '!!!' },
          ],
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
                {
                  type: 'figureByline',
                  children: [{ text: 'Jame' }, { text: ' Joyce' }],
                },
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
          children: [{ text: 'Read the rest of the story on www.republik.ch' }],
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

  describe('Custom normalisations', () => {
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
