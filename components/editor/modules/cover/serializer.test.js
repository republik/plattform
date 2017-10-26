import test from 'tape'
import createCoverModule from './'

const TYPE = 'COVER'
const coverModule = createCoverModule({
  TYPE,
  subModules: []
})

const serializer = coverModule.helpers.serializer

test('cover serialization', assert => {
  const md = `<section><h6>${TYPE}</h6>

![Alt](img.jpg)

# Title

> Lead

<hr /></section>`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, TYPE)

  assert.equal(serializer.serialize(state).trimRight(), md)
  assert.end()
})
