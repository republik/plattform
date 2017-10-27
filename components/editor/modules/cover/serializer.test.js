import test from 'tape'
import createCoverModule from './'
import createHeadlineModule from '../headline'

const TYPE = 'COVER'

const titleModule = createHeadlineModule({
  TYPE: 'H1',
  rule: {
    options: {
      depth: 1
    }
  },
  subModules: []
})
titleModule.identifier = 'H1'

const coverModule = createCoverModule({
  TYPE,
  rule: {},
  subModules: [
    titleModule
  ]
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
