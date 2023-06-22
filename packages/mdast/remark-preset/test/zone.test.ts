import { parse, stringify } from '../src'

describe('zone node', () => {
  test('serialization', () => {
    const md = `<section><h6>Z</h6>

<hr /></section>\n`
    const rootNode = parse(md)
    const node = rootNode.children[0]

    expect(node.type).toEqual('zone')
    expect(node.identifier).toEqual('Z')

    expect(stringify(rootNode)).toEqual(md)
  })

  test('zone data serialization', () => {
    const md = `<section><h6>WithData</h6>

\`\`\`
{
  "KEY": "VALUE"
}
\`\`\`

<hr /></section>\n`
    const rootNode = parse(md)
    const node = rootNode.children[0]

    expect(node.type).toEqual('zone')
    expect(node.identifier).toEqual('WithData')

    expect(node.data.KEY).toEqual('VALUE')

    expect(stringify(rootNode)).toEqual(md)
  })

  test('nested zone serialization', () => {
    const md = `<section><h6>A</h6>

<section><h6>AB</h6>

<hr /></section>

<hr /></section>\n`
    const rootNode = parse(md)
    const node = rootNode.children[0]

    expect(node.type).toEqual('zone')
    expect(node.identifier).toEqual('A')

    const zoneB = node.children[0]

    expect(zoneB.type).toEqual('zone')
    expect(zoneB.identifier).toEqual('AB')

    expect(stringify(rootNode)).toEqual(md)
  })

  test('sequential zone serialization', () => {
    const md = `<section><h6>A</h6>

<hr /></section>

<section><h6>B</h6>

<hr /></section>\n`
    const rootNode = parse(md)
    const zoneA = rootNode.children[0]

    expect(zoneA.type).toEqual('zone')
    expect(zoneA.identifier).toEqual('A')

    const zoneB = rootNode.children[1]

    expect(zoneB.type).toEqual('zone')
    expect(zoneB.identifier).toEqual('B')

    expect(stringify(rootNode)).toEqual(md)
  })

  test('sequential and nested zone serialization', () => {
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

    expect(zoneA.type).toEqual('zone')
    expect(zoneA.identifier).toEqual('A')

    const zoneB = rootNode.children[1]

    expect(zoneB.type).toEqual('zone')
    expect(zoneB.identifier).toEqual('B')

    const zoneBA = zoneB.children[0]

    expect(zoneBA.type).toEqual('zone')
    expect(zoneBA.identifier).toEqual('BA')

    const zoneBAA = zoneBA.children[0]

    expect(zoneBAA.type).toEqual('zone')
    expect(zoneBAA.identifier).toEqual('BAA')

    const zoneBAB = zoneBA.children[1]

    expect(zoneBAB.type).toEqual('zone')
    expect(zoneBAB.identifier).toEqual('BAB')

    const zoneBB = zoneB.children[1]

    expect(zoneBB.type).toEqual('zone')
    expect(zoneBB.identifier).toEqual('BB')

    expect(stringify(rootNode)).toEqual(md)
  })

  test('ignore unclosed zones', () => {
    const md = `<section><h6>BAB</h6>\n`
    expect(() => {
      parse(md)
    }).not.toThrow()
  })

  test('zone with first html code child', () => {
    const md = `<section><h6>HTML</h6>

\`\`\`html
<div></div>
\`\`\`

<hr /></section>\n`
    expect(() => {
      parse(md)
    }).not.toThrow()
  })

  test('zone with first code child', () => {
    const md = `<section><h6>HTML</h6>

\`\`\`
Not valid JSON
\`\`\`

<hr /></section>\n`
    const rootNode = parse(md)
    const zone = rootNode.children[0]

    expect(zone.data).toEqual({})
  })
})
