import test from 'tape'
import {serializer, LEAD} from './'

test('lead serialization', assert => {
  const state = serializer.deserialize('> A **test**')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, LEAD)
  assert.equal(node.text, 'A test')

  assert.equal(serializer.serialize(state).trimRight(), '> A **test**')
  assert.end()
})
