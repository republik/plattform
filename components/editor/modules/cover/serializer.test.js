import test from 'tape'
import cover, {COVER} from './'
import {getSerializationRules} from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getSerializationRules([
    ...cover.plugins
  ])
})

test('cover serialization', assert => {
  const md = `<section><h6>${COVER}</h6>

![Alt](img.jpg)

# Title

> Lead

<hr /></section>`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, COVER)

  assert.equal(serializer.serialize(state).trimRight(), md)
  assert.end()
})
