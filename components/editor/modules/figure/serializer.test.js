import test from 'tape'
import img, { FIGURE } from './'
import {PARAGRAPH} from '../paragraph'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules(img.plugins).concat({
    match: (object) => object.kind === 'block' && object.type === PARAGRAPH,
    matchMdast: (node) => node.type === 'paragraph',
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: PARAGRAPH,
      nodes: visitChildren(node)
    }),
    toMdast: (object, index, parent, visitChildren) => ({
      type: 'paragraph',
      children: visitChildren(object)
    })
  })
})

test('image serialization', assert => {
  const state = serializer.deserialize('![Alt](example.com/img.jpg "Title")')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, PARAGRAPH)

  const img = node.nodes.find(node => node.type === FIGURE)
  assert.ok(img)

  assert.equal(img.getIn(['data', 'src']), 'example.com/img.jpg')
  assert.equal(img.getIn(['data', 'alt']), 'Alt')
  assert.equal(img.getIn(['data', 'title']), 'Title')

  assert.equal(serializer.serialize(state).trimRight(), '![Alt](example.com/img.jpg "Title")')
  assert.end()
})
