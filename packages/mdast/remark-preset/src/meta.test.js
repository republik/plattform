const test = require('tape')
const { parse, stringify } = require('./')

test('meta serialization', assert => {
  const md = `---
foo: true
bar: foomobile
---

# A Test
`
  const rootNode = parse(md)

  assert.equal(rootNode.meta.foo, true)
  assert.equal(rootNode.meta.bar, 'foomobile')

  assert.equal(stringify(rootNode), md)

  assert.end()
})
