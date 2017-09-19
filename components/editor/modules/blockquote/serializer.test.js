import test from 'tape'
import { serializer, BLOCKQUOTE } from './'

test('blockquote serialization', assert => {
  const state = serializer.deserialize('> A _test_')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, BLOCKQUOTE)
  assert.equal(node.text, 'A test')

  assert.equal(serializer.serialize(state).trimRight(), '> A _test_')
  assert.end()
})
