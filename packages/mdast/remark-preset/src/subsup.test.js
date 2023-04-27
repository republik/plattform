const test = require('tape')
const { parse, stringify } = require('./')

test('sub serialization', assert => {
  const md = `# CO<sub>2</sub>

CO<sub>2</sub>

CO<sub>2eq</sub>

PM<sub>2,5</sub>

<section><h6>ZONE</h6>

PM<sub>2,5</sub>

<hr /></section>
`
  const rootNode = parse(md)

  const checkSub = (node, text) => {
    const sub = node.children
      .find(n => n.type === 'sub')
    assert.ok(sub, 'find sub node')
    assert.equal(sub.children[0].value, text, 'has expected text')
  }

  const subTexts = [
    '2',
    '2',
    '2eq',
    '2,5'
  ]
  subTexts.forEach((subText, index) => {
    checkSub(rootNode.children[index], subText)
  })

  const zone = rootNode.children.find(node => node.type === 'zone')

  assert.ok(zone, 'zone and sub can coexist')
  checkSub(zone.children[0], '2,5')

  assert.equal(stringify(rootNode), md)

  assert.end()
})

test('sup serialization', assert => {
  const md = '40 µg/m<sup>3</sup>\n'
  const rootNode = parse(md)
  const superTexts = [
    '3'
  ]

  superTexts.forEach((supText, index) => {
    const sup = rootNode.children[index].children
      .find(n => n.type === 'sup')
    assert.ok(sup, true)
    assert.equal(sup.children[0].value, supText)
  })

  assert.equal(stringify(rootNode), md)

  assert.end()
})

test('ignore invalid inline zones', assert => {
  const md = `CO<sub>2</sub>

<sub>invalid multi paragraph zone

content

the end</sub>\n`
  let rootNode
  assert.doesNotThrow(() => {
    rootNode = parse(md)
  })

  const p0 = rootNode.children[0]
  assert.equal(p0.children[1].type, 'sub')

  const p1 = rootNode.children[1]
  assert.equal(p1.children[0].type, 'html')

  assert.end()
})


test('sups in children after end', assert => {
  const md = `<sup>2</sup>: **<sup>2</sup>**, _<sup>2</sup>_, **_<sup>2</sup>_**`

  const rootNode = parse(md)
  const p = rootNode.children[0]

  assert.equal(p.children[0].type, 'sup')

  const strong = p.children.find(node => node.type === 'strong')
  assert.equal(strong.children[0].type, 'sup')

  const emphasis = p.children.find(node => node.type === 'emphasis')
  assert.equal(emphasis.children[0].type, 'sup')

  const strongEmphasis = p.children.find(node => (
    node.type === 'strong' &&
    node.children[0].type === 'emphasis'
  )).children[0]

  assert.equal(strongEmphasis.children[0].type, 'sup')

  assert.end()
})
