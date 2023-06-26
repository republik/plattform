import { parse, stringify } from '@republik/remark-preset'

import createBlockquoteModule from './'
import createParagraphModule from '../paragraph'

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
    const value = serializer.deserialize(parse('> A test'))
    const node = value.document.nodes.first()
    expect(node.kind).toBe('block')
    expect(node.type).toBe('BLOCKQUOTE')
    expect(node.text).toBe('A test')
    expect(stringify(serializer.serialize(value)).trimRight()).toBe('> A test')
  })
})
