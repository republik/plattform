import MarkdownSerializer from '../src'
import { parse, stringify } from '@republik/remark-preset'

const serializer = new MarkdownSerializer({
  rules: [
    {
      match: (object) => object.kind === 'block',
      matchMdast: (node) => node.type === 'zone',
      fromMdast: (node, index, parent, { visitChildren }) => ({
        kind: 'block',
        type: node.identifier,
        data: node.data,
        nodes: visitChildren(node),
      }),
      toMdast: (object, index, parent, { visitChildren }) => ({
        type: 'zone',
        identifier: object.type,
        data: object.data,
        children: visitChildren(object),
      }),
    },
  ],
})

describe('zone serialization', () => {
  test('basic check', () => {
    const md = `<section><h6>Z</h6>



<hr /></section>\n`
    const state = serializer.deserialize(parse(md))
    const node = state.document.nodes.first()

    expect(node.kind).toEqual('block')
    expect(node.type).toEqual('Z')

    expect(stringify(serializer.serialize(state))).toEqual(md)
  })

  test('data serialization', () => {
    const md = `<section><h6>WithData</h6>

\`\`\`
{
  "KEY": "VALUE"
}
\`\`\`



<hr /></section>\n`
    const state = serializer.deserialize(parse(md))
    const node = state.document.nodes.first()

    expect(node.kind).toEqual('block')
    expect(node.type).toEqual('WithData')

    expect(node.data.get('KEY')).toEqual('VALUE')

    expect(stringify(serializer.serialize(state))).toEqual(md)
  })

  test('nested serialization', () => {
    const md = `<section><h6>A</h6>

<section><h6>AB</h6>



<hr /></section>

<hr /></section>\n`
    const state = serializer.deserialize(parse(md))
    const node = state.document.nodes.first()

    expect(node.kind).toEqual('block')
    expect(node.type).toEqual('A')

    const zoneB = node.nodes.first()

    expect(zoneB.kind).toEqual('block')
    expect(zoneB.type).toEqual('AB')

    expect(stringify(serializer.serialize(state))).toEqual(md)
  })

  test('sequential serialization', () => {
    const md = `<section><h6>A</h6>



<hr /></section>

<section><h6>B</h6>



<hr /></section>\n`
    const state = serializer.deserialize(parse(md))
    const zoneA = state.document.nodes.first()

    expect(zoneA.kind).toEqual('block')
    expect(zoneA.type).toEqual('A')

    const zoneB = state.document.nodes.get(1)

    expect(zoneB.kind).toEqual('block')
    expect(zoneB.type).toEqual('B')

    expect(stringify(serializer.serialize(state))).toEqual(md)
  })

  test('sequential and nested serialization', () => {
    const md = `<section><h6>A</h6>



<hr /></section>

<section><h6>B</h6>

<section><h6>BA</h6>

<section><h6>BAA</h6>



<hr /></section>

<section><h6>BAB</h6>



<hr /></section>

<hr /></section>

<section><h6>BB</h6>



<hr /></section>

<hr /></section>\n`
    const state = serializer.deserialize(parse(md))
    const zoneA = state.document.nodes.first()

    expect(zoneA.kind).toEqual('block')
    expect(zoneA.type).toEqual('A')

    const zoneB = state.document.nodes.get(1)

    expect(zoneB.kind).toEqual('block')
    expect(zoneB.type).toEqual('B')

    const zoneBA = zoneB.nodes.first()

    expect(zoneBA.kind).toEqual('block')
    expect(zoneBA.type).toEqual('BA')

    const zoneBAA = zoneBA.nodes.first()

    expect(zoneBAA.kind).toEqual('block')
    expect(zoneBAA.type).toEqual('BAA')

    const zoneBAB = zoneBA.nodes.get(1)

    expect(zoneBAB.kind).toEqual('block')
    expect(zoneBAB.type).toEqual('BAB')

    const zoneBB = zoneB.nodes.get(1)

    expect(zoneBB.kind).toEqual('block')
    expect(zoneBB.type).toEqual('BB')

    expect(stringify(serializer.serialize(state))).toEqual(md)
  })
})
