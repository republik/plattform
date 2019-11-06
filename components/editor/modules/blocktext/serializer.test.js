import test from 'tape'
import { parse, stringify } from '@orbiting/remark-preset'

import createBlockquoteModule from './'
import createParagraphModule from '../paragraph'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: []
})
paragraphModule.name = 'paragraph'

const blockquoteModule = createBlockquoteModule({
  TYPE: 'BLOCKQUOTE',
  rule: {
    matchMdast: node => node.type === 'blockquote'
  },
  subModules: [paragraphModule]
})
blockquoteModule.name = 'blockquote'

const serializer = blockquoteModule.helpers.serializer

test('blockquote serialization', assert => {
  const value = serializer.deserialize(parse('> A test'))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'BLOCKQUOTE')
  assert.equal(node.text, 'A test')

  assert.equal(stringify(serializer.serialize(value)).trimRight(), '> A test')
  assert.end()
})
