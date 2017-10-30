import test from 'tape'

import createLinkModule from './'
import createParagraphModule from '../paragraph'

const linkModule = createLinkModule({
  TYPE: 'LINK',
  rule: {},
  subModules: []
})
linkModule.name = 'link'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: [
    linkModule
  ]
})
paragraphModule.name = 'paragraph'

const serializer = paragraphModule.helpers.serializer

test('link serialization', assert => {
  const value = serializer.deserialize('[Test](example.com)')
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'PARAGRAPH')
  assert.equal(node.text, 'Test')

  const link = node.nodes.find(node => node.type === 'LINK')
  assert.ok(link)

  assert.equal(link.getIn(['data', 'href']), 'example.com')

  assert.equal(serializer.serialize(value).trimRight(), '[Test](example.com)')
  assert.end()
})
