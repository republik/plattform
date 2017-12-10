import test from 'tape'
import createParagraphModule from './'
import { parse, stringify } from '@orbiting/remark-preset'

const paragraphModule = createParagraphModule({
  TYPE: 'P',
  rule: {},
  subModules: []
})

const serializer = paragraphModule.helpers.serializer

test('paragraph serialization', assert => {
  const value = serializer.deserialize(parse('Test'))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'P')
  assert.equal(node.text, 'Test')

  assert.equal(stringify(serializer.serialize(value)).trimRight(), 'Test')
  assert.end()
})
