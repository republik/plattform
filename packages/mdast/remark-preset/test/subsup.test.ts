import { parse, stringify } from '../src'

describe('sub and sup', () => {
  test('sub serialization', () => {
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
      const sub = node.children.find((n) => n.type === 'sub')
      expect(sub).toBeDefined()
      expect(sub.children[0].value).toEqual(text)
    }

    const subTexts = ['2', '2', '2eq', '2,5']
    subTexts.forEach((subText, index) => {
      checkSub(rootNode.children[index], subText)
    })

    const zone = rootNode.children.find((node) => node.type === 'zone')

    expect(zone).toBeDefined()
    checkSub(zone.children[0], '2,5')

    expect(stringify(rootNode)).toEqual(md)
  })

  test('sup serialization', () => {
    const md = '40 µg/m<sup>3</sup>\n'
    const rootNode = parse(md)
    const superTexts = ['3']

    superTexts.forEach((supText, index) => {
      const sup = rootNode.children[index].children.find(
        (n) => n.type === 'sup',
      )
      expect(sup).toBeDefined()
      expect(sup.children[0].value).toEqual(supText)
    })

    expect(stringify(rootNode)).toEqual(md)
  })

  test('ignore invalid inline zones', () => {
    const md = `CO<sub>2</sub>

<sub>invalid multi paragraph zone

content

the end</sub>\n`

    let rootNode
    expect(() => {
      rootNode = parse(md)
    }).not.toThrow()

    const p0 = rootNode.children[0]
    expect(p0.children[1].type).toEqual('sub')

    const p1 = rootNode.children[1]
    expect(p1.children[0].type).toEqual('html')
  })

  test('sups in children after end', () => {
    const md = `<sup>2</sup>: **<sup>2</sup>**, _<sup>2</sup>_, **_<sup>2</sup>_**`

    const rootNode = parse(md)
    const p = rootNode.children[0]

    expect(p.children[0].type).toEqual('sup')

    const strong = p.children.find((node) => node.type === 'strong')
    expect(strong.children[0].type).toEqual('sup')

    const emphasis = p.children.find((node) => node.type === 'emphasis')
    expect(emphasis.children[0].type).toEqual('sup')

    const strongEmphasis = p.children.find(
      (node) => node.type === 'strong' && node.children[0].type === 'emphasis',
    ).children[0]

    expect(strongEmphasis.children[0].type).toEqual('sup')
  })
})
