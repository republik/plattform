import test from 'tape'
import {
  serializer,
  MEDIUM_HEADLINE,
  SMALL_HEADLINE
} from './'

test('medium headline serialization', assert => {
  const state = serializer.deserialize('## Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, MEDIUM_HEADLINE)
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '## Test')
  assert.end()
})

test('small headline serialization', assert => {
  const state = serializer.deserialize('### Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, SMALL_HEADLINE)
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '### Test')
  assert.end()
})
