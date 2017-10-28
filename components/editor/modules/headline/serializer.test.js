import test from 'tape'
import createHeadlineModule from './'

test('h1 serialization', assert => {
  const module = createHeadlineModule({
    TYPE: 'H1',
    rule: {
      editorOptions: {
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

test('h2 serialization', assert => {
  const module = createHeadlineModule({
    TYPE: 'H2',
    rule: {
      editorOptions: {
        depth: 2
      }
    },
    subModules: []
  })

  const serializer = module.helpers.serializer

  const state = serializer.deserialize('## Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'H2')
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '## Test')
  assert.end()
})

test('h3 serialization', assert => {
  const module = createHeadlineModule({
    TYPE: 'H3',
    rule: {
      editorOptions: {
        depth: 3
      }
    },
    subModules: []
  })

  const serializer = module.helpers.serializer

  const state = serializer.deserialize('### Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'H3')
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '### Test')
  assert.end()
})
