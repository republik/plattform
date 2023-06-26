import MarkdownSerializer from '../src'
import { parse } from '@republik/remark-preset'

const serializer = new MarkdownSerializer()

describe('meta serialization', () => {
  test('sanity check', () => {
    const mdast = parse(`---
foo: true
bar: foomobile
---
`)
    const state = serializer.deserialize(mdast)

    expect(state.document.data.get('foo')).toEqual(true)
    expect(state.document.data.get('bar')).toEqual('foomobile')
  })
})
