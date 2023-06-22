import { parse, stringify } from '../src'

describe('node metadata', () => {
  test('serialization works', () => {
    const md = `---
foo: true
bar: foomobile
---

# A Test
`
    const rootNode = parse(md)

    expect(rootNode.meta.foo).toEqual(true)
    expect(rootNode.meta.bar).toEqual('foomobile')

    expect(stringify(rootNode)).toEqual(md)
  })
})
