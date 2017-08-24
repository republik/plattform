import test from 'tape'
import title, {TITLE} from './'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: title.plugins.reduce(
    (all, plugin) => all.concat((plugin.schema || {}).rules),
    []
  )
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
