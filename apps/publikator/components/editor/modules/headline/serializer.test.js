import createHeadlineModule from './'
import { parse, stringify } from '@republik/remark-preset'

describe('headline serializer test-suite', () => {
  it('h1 serialization', () => {
    const module = createHeadlineModule({
      TYPE: 'H1',
      rule: {
        editorOptions: {
          depth: 1,
        },
      },
      subModules: [],
    })

    const serializer = module.helpers.serializer

    const value = serializer.deserialize(parse('# Test'))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('H1')
    expect(node.text).toBe('Test')

    expect(stringify(serializer.serialize(value)).trimRight()).toBe('# Test')
  })

  it('h2 serialization', () => {
    const module = createHeadlineModule({
      TYPE: 'H2',
      rule: {
        editorOptions: {
          depth: 2,
        },
      },
      subModules: [],
    })

    const serializer = module.helpers.serializer

    const value = serializer.deserialize(parse('## Test'))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('H2')
    expect(node.text).toBe('Test')

    expect(stringify(serializer.serialize(value)).trimRight()).toBe('## Test')
  })

  it('h3 serialization', () => {
    const module = createHeadlineModule({
      TYPE: 'H3',
      rule: {
        editorOptions: {
          depth: 3,
        },
      },
      subModules: [],
    })

    const serializer = module.helpers.serializer

    const value = serializer.deserialize(parse('### Test'))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('H3')
    expect(node.text).toBe('Test')

    expect(stringify(serializer.serialize(value)).trimRight()).toBe('### Test')
  })
})
