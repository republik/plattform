import test from 'tape'
import MarkdownSerializer from './'

const serializer = new MarkdownSerializer({
  rules: [
    {
      match: object => object.kind === 'block',
      matchMdast: (node) => node.type === 'heading' && node.depth === 1,
      fromMdast: (node, index, parent, visitChildren) => ({
        kind: 'block',
        type: 'title',
        nodes: visitChildren(node)
      }),
      toMdast: (object, index, parent, visitChildren) => ({
        type: 'heading',
        depth: 1,
        children: visitChildren(object)
      })
    }
  ]
})

test('meta serialization', assert => {
  const md = `---
test: true
title: Test
---

# A Test
`
  const state = serializer.deserialize(md)
  const node = state.document

  assert.equal(node.data.get('title'), 'Test')
  assert.equal(node.data.get('test'), true)

  assert.equal(serializer.serialize(state), md)

  assert.end()
})
