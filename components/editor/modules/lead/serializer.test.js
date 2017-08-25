import test from 'tape'
import lead, {LEAD} from './'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules(lead.plugins)
})

test('lead serialization', assert => {
  const state = serializer.deserialize('> Test')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, LEAD)
  assert.equal(node.text, 'Test')

  assert.equal(serializer.serialize(state).trimRight(), '> Test')
  assert.end()
})
