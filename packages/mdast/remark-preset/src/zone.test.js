const test = require('tape')
const { parse, stringify } = require('./')

test('zone serialization', assert => {
  const md = `<section><h6>Z</h6>

<hr /></section>\n`
  const rootNode = parse(md)
  const node = rootNode.children[0]

  assert.equal(node.type, 'zone')
  assert.equal(node.identifier, 'Z')

  assert.equal(stringify(rootNode), md)

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
  const rootNode = parse(md)
  const node = rootNode.children[0]

  assert.equal(node.type, 'zone')
  assert.equal(node.identifier, 'WithData')

  assert.equal(node.data.KEY, 'VALUE')

  assert.equal(stringify(rootNode), md)

  assert.end()
})

test('nested zone serialization', assert => {
  const md = `<section><h6>A</h6>

<section><h6>AB</h6>

<hr /></section>

<hr /></section>\n`
  const rootNode = parse(md)
  const node = rootNode.children[0]

  assert.equal(node.type, 'zone')
  assert.equal(node.identifier, 'A')

  const zoneB = node.children[0]

  assert.equal(zoneB.type, 'zone')
  assert.equal(zoneB.identifier, 'AB')

  assert.equal(stringify(rootNode), md)

  assert.end()
})

test('sequential zone serialization', assert => {
  const md = `<section><h6>A</h6>

<hr /></section>

<section><h6>B</h6>

<hr /></section>\n`
  const rootNode = parse(md)
  const zoneA = rootNode.children[0]

  assert.equal(zoneA.type, 'zone')
  assert.equal(zoneA.identifier, 'A')

  const zoneB = rootNode.children[1]

  assert.equal(zoneB.type, 'zone')
  assert.equal(zoneB.identifier, 'B')

  assert.equal(stringify(rootNode), md)

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
  const rootNode = parse(md)
  const zoneA = rootNode.children[0]

  assert.equal(zoneA.type, 'zone')
  assert.equal(zoneA.identifier, 'A')

  const zoneB = rootNode.children[1]

  assert.equal(zoneB.type, 'zone')
  assert.equal(zoneB.identifier, 'B')

  const zoneBA = zoneB.children[0]

  assert.equal(zoneBA.type, 'zone')
  assert.equal(zoneBA.identifier, 'BA')

  const zoneBAA = zoneBA.children[0]

  assert.equal(zoneBAA.type, 'zone')
  assert.equal(zoneBAA.identifier, 'BAA')

  const zoneBAB = zoneBA.children[1]

  assert.equal(zoneBAB.type, 'zone')
  assert.equal(zoneBAB.identifier, 'BAB')

  const zoneBB = zoneB.children[1]

  assert.equal(zoneBB.type, 'zone')
  assert.equal(zoneBB.identifier, 'BB')

  assert.equal(stringify(rootNode), md)

  assert.end()
})

test('ignore unclosed zones', assert => {
  const md = `<section><h6>BAB</h6>\n`
  let rootNode
  assert.doesNotThrow(() => {
    rootNode = parse(md)
  })
  assert.end()
})

test('zone with first html code child', assert => {
  const md = `<section><h6>HTML</h6>

\`\`\`html
<div></div>
\`\`\`

<hr /></section>\n`
  let rootNode
  assert.doesNotThrow(() => {
    rootNode = parse(md)
  })
  assert.end()
})

test('zone with first code child', assert => {
  const md = `<section><h6>HTML</h6>

\`\`\`
Not valid JSON
\`\`\`

<hr /></section>\n`
  let rootNode
  assert.doesNotThrow(() => {
    rootNode = parse(md)
  })

  const zone = rootNode.children[0]

  assert.deepEqual(zone.data, {})

  assert.end()
})
