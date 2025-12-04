import createParagraphModule from '../paragraph'

import createBlockquoteModule from './'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: [],
})
paragraphModule.name = 'paragraph'

const blockquoteModule = createBlockquoteModule({
  TYPE: 'BLOCKQUOTE',
  rule: {
    matchMdast: (node) => node.type === 'blockquote',
  },
  subModules: [paragraphModule],
})
blockquoteModule.name = 'blockquote'

const serializer = blockquoteModule.helpers.serializer

describe('blockquote serializer test-suite', () => {
  it('blockquote serialization', () => {
    const mdast = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          data: {},
          identifier: undefined,
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'A test' }],
            },
          ],
        },
      ],
      meta: {},
    }
    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()
    expect(node.kind).toBe('block')
    expect(node.type).toBe('BLOCKQUOTE')
    expect(node.text).toBe('A test')
    expect(serializer.serialize(value)).toEqual(mdast)
  })
})
