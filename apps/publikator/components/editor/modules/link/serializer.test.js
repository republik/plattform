import createParagraphModule from '../paragraph'

import createLinkModule from './'

const linkModule = createLinkModule({
  TYPE: 'LINK',
  rule: {
    matchMdast: (node) => node.type === 'link',
  },
  subModules: [],
})
linkModule.name = 'link'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: [linkModule],
})
paragraphModule.name = 'paragraph'

const serializer = paragraphModule.helpers.serializer

describe('link serializer test-suite', () => {
  it('link serialization', () => {
    const mdast = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              title: '',
              url: 'example.com',
              children: [{ type: 'text', value: 'Test' }],
            },
          ],
        },
      ],
      meta: {},
    }

    const mdastNormalised = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: '' },
            {
              type: 'link',
              title: '',
              url: 'example.com',
              children: [{ type: 'text', value: 'Test' }],
            },
            { type: 'text', value: '' },
          ],
        },
      ],
      meta: {},
    }

    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('PARAGRAPH')
    expect(node.text).toBe('Test')

    const link = node.nodes.find((node) => node.type === 'LINK')
    expect(link).toBeTruthy()

    expect(link.getIn(['data', 'href'])).toBe('example.com')

    expect(serializer.serialize(value)).toEqual(mdastNormalised)
  })
})
