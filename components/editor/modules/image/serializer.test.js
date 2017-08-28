import test from 'tape'
import img, {IMAGE} from './'
import paragraph, {PARAGRAPH} from '../paragraph'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules([
    ...img.plugins,
    ...paragraph.plugins
  ])
})

test('image serialization', assert => {
  const state = serializer.deserialize('![Alt](example.com/img.jpg "Title")')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, PARAGRAPH)

  const img = node.nodes.find(node => node.type === IMAGE)
  assert.ok(img)

  assert.equal(img.getIn(['data', 'src']), 'example.com/img.jpg')
  assert.equal(img.getIn(['data', 'alt']), 'Alt')
  assert.equal(img.getIn(['data', 'title']), 'Title')

  assert.equal(serializer.serialize(state).trimRight(), '![Alt](example.com/img.jpg "Title")')
  assert.end()
})
