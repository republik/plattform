import test from 'tape'
import createParagraphModule from './'

const paragraphModule = createParagraphModule({
  TYPE: 'P',
  rule: {},
  subModules: []
})

const serializer = paragraphModule.helpers.serializer

test('paragraph serialization', assert => {
  const state = serializer.deserialize('Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'P')
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), 'Test')
  assert.end()
})
