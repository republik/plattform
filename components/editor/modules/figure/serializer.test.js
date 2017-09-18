import test from 'tape'
import { serializer } from './'
import { FIGURE, FIGURE_IMAGE, FIGURE_CAPTION } from './constants'

// import getRules from '../../utils/getRules'
// import MarkdownSerializer from '../../../../lib/serializer'

test('figure serialization', assert => {
  const md = `<section><h6>${FIGURE}</h6>

![Alt](example.com/img.jpg)

Caption

<hr /></section>`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  const image = node.nodes.first()
  assert.equal(image.kind, 'block')
  assert.equal(image.type, FIGURE_IMAGE)

  assert.equal(image.getIn(['data', 'src']), 'example.com/img.jpg')
  assert.equal(image.getIn(['data', 'alt']), 'Alt')

  const caption = node.nodes.get(1)
  assert.equal(caption.kind, 'block')
  assert.equal(caption.type, FIGURE_CAPTION)
  assert.equal(caption.text, 'Caption')

  assert.equal(serializer.serialize(state).trimRight(), md)
  assert.end()
})
