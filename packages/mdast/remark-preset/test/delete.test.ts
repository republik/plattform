import { parse, stringify } from '../src'

describe('delete node', () => {
  test('serialization works', () => {
    const md = '~~Average~~Median\n'
    const rootNode = parse(md)

    const p = rootNode.children[0]
    expect(p.type).toEqual('paragraph')

    const deleteNode = p.children[0]
    expect(deleteNode.type).toEqual('delete')
    expect(deleteNode.children[0].value).toEqual('Average')

    expect(p.children[1].value).toEqual('Median')

    expect(stringify(rootNode)).toEqual(md)
  })
})
