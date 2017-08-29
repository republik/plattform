import test from 'tape'
import paragraph, {PARAGRAPH} from './'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules(paragraph.plugins)
})

test('paragraph serialization', assert => {
  const state = serializer.deserialize('Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, PARAGRAPH)
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), 'Test')
  assert.end()
})
