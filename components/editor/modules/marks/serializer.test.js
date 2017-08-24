import test from 'tape'
import marks, {BOLD, ITALIC} from './'
import paragraph, {PARAGRAPH} from '../paragraph'
import getRules from '../../utils/getRules'
import MarkdownSerializer from '../../../../lib/serializer'

const serializer = new MarkdownSerializer({
  rules: getRules([
    ...marks.plugins,
    ...paragraph.plugins
  ])
})

test('marks serialization', assert => {
  const state = serializer.deserialize('**bold** _italic_ ~~strikethrough~~')
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, PARAGRAPH)
  assert.equal(node.text, 'bold italic strikethrough')

  const text = node.nodes.first()

  assert.equal(text.characters.get(0).marks.first().type, BOLD)
  assert.equal(text.characters.get(8).marks.first().type, ITALIC)

  assert.equal(
    serializer.serialize(state).trimRight(),
    '**bold** _italic_ ~~strikethrough~~'
  )
  assert.end()
})

test('nested marks serialization', assert => {
  const state = serializer.deserialize('**_test_**')

  assert.equal(
    serializer.serialize(state).trimRight(),
    '**_test_**'
  )
  assert.end()
})
