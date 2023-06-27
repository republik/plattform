import createParagraphModule from './'
import { parse, stringify } from '@republik/remark-preset'
import { boldModule } from '../mark/testUtils'

describe('paragraph serialization test-suite', () => {
  it('paragraph serialization', () => {
    const paragraphModule = createParagraphModule({
      TYPE: 'P',
      rule: {},
      subModules: [],
    })

    const serializer = paragraphModule.helpers.serializer

    const value = serializer.deserialize(parse('Test'))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('P')
    expect(node.text).toBe('Test')

    expect(stringify(serializer.serialize(value)).trimRight()).toBe('Test')
  })

  it('paragraph with break in mark', () => {
    const paragraphModule = createParagraphModule({
      TYPE: 'P',
      rule: {},
      subModules: [boldModule],
    })

    const serializer = paragraphModule.helpers.serializer

    const md = `A**${'  '}
B**
`
    const value = serializer.deserialize(parse(md))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('P')
    expect(node.text).toBe('A\nB')

    expect(stringify(serializer.serialize(value))).toBe(md)
  })

  it('paragraph with mdastPlaceholder', () => {
    const paragraphModule = createParagraphModule({
      TYPE: 'P',
      rule: {
        editorOptions: {
          mdastPlaceholder: '\u2063',
        },
      },
      subModules: [],
    })

    const serializer = paragraphModule.helpers.serializer

    const md = `\u2063
`
    const value = serializer.deserialize(parse(md))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('P')
    expect(node.text).toBe(String())

    expect(stringify(serializer.serialize(value))).toBe(md)
  })
})
