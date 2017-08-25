import test from 'tape'
import link, {LINK} from './'
import paragraph, {PARAGRAPH} from '../paragraph'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules([
    ...link.plugins,
    ...paragraph.plugins
  ])
})

test('link serialization', assert => {
  const state = serializer.deserialize('[Test](example.com)')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, PARAGRAPH)
  assert.equal(node.text, 'Test')

  const link = node.nodes.find(node => node.type === LINK)
  assert.ok(link)

  assert.equal(link.getIn(['data', 'href']), 'example.com')

  assert.equal(serializer.serialize(state).trimRight(), '[Test](example.com)')
  assert.end()
})
