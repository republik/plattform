import test from 'tape'

import createBlockquoteModule from './'
import createParagraphModule from '../paragraph/v2'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: []
})
paragraphModule.identifier = 'PARAGRAPH'

const blockquoteModule = createBlockquoteModule({
  TYPE: 'BLOCKQUOTE',
  rule: {},
  subModules: [
    paragraphModule
  ]
})
blockquoteModule.identifier = 'BLOCKQUOTE'

const serializer = blockquoteModule.helpers.serializer

test('blockquote serialization', assert => {
  const state = serializer.deserialize('> A test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'BLOCKQUOTE')
  assert.equal(node.text, 'A test')

  assert.equal(serializer.serialize(state).trimRight(), '> A test')
  assert.end()
})
