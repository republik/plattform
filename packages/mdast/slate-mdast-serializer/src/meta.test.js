import test from 'tape'
import MarkdownSerializer from './'
import { parse } from '@orbiting/remark-preset'

const serializer = new MarkdownSerializer()

test('meta serialization', assert => {
  const mdast = parse(`---
foo: true
bar: foomobile
---
`)
  const state = serializer.deserialize(mdast)

  assert.equal(state.document.data.get('foo'), true)
  assert.equal(state.document.data.get('bar'), 'foomobile')

  assert.end()
})
