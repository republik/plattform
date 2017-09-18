import test from 'tape'
import figure, { FIGURE } from './'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules(figure.plugins)
})

test('figure serialization', assert => {
  const md = `<section><h6>${FIGURE}</h6>

![Alt](example.com/img.jpg)

<hr /></section>`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  assert.equal(node.getIn(['data', 'src']), 'example.com/img.jpg')
  assert.equal(node.getIn(['data', 'alt']), 'Alt')

  assert.equal(serializer.serialize(state).trimRight(), md)
  assert.end()
})
