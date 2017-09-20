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

test('sequential and nested zone serialization', assert => {
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
  const state = serializer.deserialize(md)
  const zoneA = state.document.nodes.first()

  assert.equal(zoneA.kind, 'block')
  assert.equal(zoneA.type, 'A')

  const zoneB = state.document.nodes.get(1)

  assert.equal(zoneB.kind, 'block')
  assert.equal(zoneB.type, 'B')

  const zoneBA = zoneB.nodes.first()

  assert.equal(zoneBA.kind, 'block')
  assert.equal(zoneBA.type, 'BA')

  const zoneBAA = zoneBA.nodes.first()

  assert.equal(zoneBAA.kind, 'block')
  assert.equal(zoneBAA.type, 'BAA')

  const zoneBAB = zoneBA.nodes.get(1)

  assert.equal(zoneBAB.kind, 'block')
  assert.equal(zoneBAB.type, 'BAB')

  const zoneBB = zoneB.nodes.get(1)

  assert.equal(zoneBB.kind, 'block')
  assert.equal(zoneBB.type, 'BB')

  assert.equal(serializer.serialize(state), md)

  assert.end()
})
