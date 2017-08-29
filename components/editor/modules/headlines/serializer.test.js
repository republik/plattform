import test from 'tape'
import headlines, {
  TITLE,
  MEDIUM_HEADLINE,
  SMALL_HEADLINE
} from './'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules(headlines.plugins)
})

test('title serialization', assert => {
  const state = serializer.deserialize('# Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, TITLE)
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '# Test')
  assert.end()
})

test('medium headline serialization', assert => {
  const state = serializer.deserialize('## Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, MEDIUM_HEADLINE)
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '## Test')
  assert.end()
})

test('small headline serialization', assert => {
  const state = serializer.deserialize('### Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, SMALL_HEADLINE)
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '### Test')
  assert.end()
})
