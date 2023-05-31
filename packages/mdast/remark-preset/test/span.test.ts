import { parse, stringify } from '../src'

describe('spans', () => {
  test('serialization', () => {
    const md = '<span data-number="10000">10\'000</span>\n'
    const rootNode = parse(md)

    const p = rootNode.children[0]
    expect(p.type).toEqual('paragraph')

    const number = p.children[0]
    expect(number.type).toEqual('span')
    expect(number.data.number).toEqual('10000')
    expect(number.children[0].value).toEqual("10'000")

    expect(stringify(rootNode)).toEqual(md)
  })

  const getNumber = (rootNode) => rootNode.children[0].children[0]

  test('data encoding', () => {
    const md = '<span data-number="10000">10\'000</span>\n'
    const rootNode = parse(md)
    const number = getNumber(rootNode)
    const complexData = JSON.stringify({
      value: 10000,
      unit: 'CHF',
    })
    number.data.number = complexData

    const cycledNumber = getNumber(parse(stringify(rootNode)))

    expect(cycledNumber.data.number).toEqual(complexData)
  })

  test('prevents you from serializing non string data', () => {
    const md = '<span data-number="10000">10\'000</span>\n'
    const rootNode = parse(md)
    const number = getNumber(rootNode)
    number.data.number = {
      value: 10000,
      unit: 'CHF',
    }

    expect(() => {
      stringify(rootNode)
    }).toThrow()
  })
})
