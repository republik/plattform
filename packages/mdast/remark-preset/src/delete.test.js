const test = require('tape')
const { parse, stringify } = require('./')

test('delete serialization', assert => {
  const md = '~~Average~~Median\n'
  const rootNode = parse(md)

  const p = rootNode.children[0]
  assert.equal(p.type, 'paragraph')

  const deleteNode = p.children[0]
  assert.equal(deleteNode.type, 'delete')
  assert.equal(deleteNode.children[0].value, 'Average')

  assert.equal(p.children[1].value, 'Median')

  assert.equal(stringify(rootNode), md)

  assert.end()
})
