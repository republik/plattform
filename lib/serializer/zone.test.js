import test from 'tape'
import MarkdownSerializer from './'

const TYPE = 'Z'

const serializer = new MarkdownSerializer({
  rules: [
    {
      match: object => object.kind === 'block',
      matchMdast: (node) => node.type === 'zone',
      fromMdast: (node, index, parent, visitChildren) => ({
        kind: 'block',
        type: node.identifier,
        data: node.data,
        nodes: visitChildren(node)
      }),
      toMdast: (object, index, parent, visitChildren) => ({
        type: 'zone',
        identifier: object.type,
        data: object.data,
        children: visitChildren(object)
      })
    }
  ]
})

test('zone serialization', assert => {
  const md = `<section><h6>${TYPE}</h6>



<hr /></section>\n`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, TYPE)

  assert.equal(serializer.serialize(state), md)

  assert.end()
})

test('zone data serialization', assert => {
  const md = `<section><h6>WithData</h6>

\`\`\`
{
  "KEY": "VALUE"
}
\`\`\`



<hr /></section>\n`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'WithData')

  assert.equal(node.data.get('KEY'), 'VALUE')

  assert.equal(serializer.serialize(state), md)

  assert.end()
})

test('nested zone serialization', assert => {
  const md = `<section><h6>A</h6>

<section><h6>AB</h6>



<hr /></section>

<hr /></section>\n`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'A')

  const zoneB = node.nodes.first()

  assert.equal(zoneB.kind, 'block')
  assert.equal(zoneB.type, 'AB')

  assert.equal(serializer.serialize(state), md)

  assert.end()
})

test('sequential zone serialization', assert => {
  const md = `<section><h6>A</h6>



<hr /></section>

<section><h6>B</h6>



<hr /></section>\n`
  const state = serializer.deserialize(md)
  const zoneA = state.document.nodes.first()

  assert.equal(zoneA.kind, 'block')
  assert.equal(zoneA.type, 'A')

  const zoneB = state.document.nodes.get(1)

  assert.equal(zoneB.kind, 'block')
  assert.equal(zoneB.type, 'B')

  assert.equal(serializer.serialize(state), md)

  assert.end()
})
