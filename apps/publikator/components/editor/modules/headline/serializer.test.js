import createHeadlineModule from './'

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

    const mdast = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Test',
            },
          ],
        },
      ],
      meta: {},
    }

    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('H1')
    expect(node.text).toBe('Test')

    expect(serializer.serialize(value)).toEqual(mdast)
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

    const mdast = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 2,
          children: [
            {
              type: 'text',
              value: 'Test',
            },
          ],
        },
      ],
      meta: {},
    }

    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('H2')
    expect(node.text).toBe('Test')

    expect(serializer.serialize(value)).toEqual(mdast)
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

    const mdast = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 3,
          children: [
            {
              type: 'text',
              value: 'Test',
            },
          ],
        },
      ],
      meta: {},
    }

    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('H3')
    expect(node.text).toBe('Test')

    expect(serializer.serialize(value)).toEqual(mdast)
  })
})
