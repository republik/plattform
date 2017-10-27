import test from 'tape'
import createHeadlineModule from './'

test('h1 serialization', assert => {
  const module = createHeadlineModule({
    TYPE: 'H1',
    rule: {
      options: {
        depth: 1
      }
    },
    subModules: []
  })

  const serializer = module.helpers.serializer

  const state = serializer.deserialize('# Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'H1')
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '# Test')
  assert.end()
})
