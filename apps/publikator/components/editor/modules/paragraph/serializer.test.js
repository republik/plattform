import { boldModule } from '../mark/testUtils'
import createParagraphModule from './'

describe('paragraph serialization test-suite', () => {
  it('paragraph serialization', () => {
    const paragraphModule = createParagraphModule({
      TYPE: 'P',
      rule: {},
      subModules: [],
    })

    const serializer = paragraphModule.helpers.serializer

    const mdast = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
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
    expect(node.type).toBe('P')
    expect(node.text).toBe('Test')

    expect(serializer.serialize(value)).toEqual(mdast)
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
    const mdast = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'A',
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: 'B',
                },
              ],
            },
          ],
        },
      ],
      meta: {},
    }

    const mdastNormalised = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'A',
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: '',
                },
                {
                  type: 'break',
                },
                {
                  type: 'text',
                  value: 'B',
                },
              ],
            },
          ],
        },
      ],
      meta: {},
    }

    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('P')
    expect(node.text).toBe('A\nB')

    expect(serializer.serialize(value)).toEqual(mdastNormalised)
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

    const mdast = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: '⁣',
            },
          ],
        },
      ],
      meta: {},
    }

    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('P')
    expect(node.text).toBe(String())

    expect(serializer.serialize(value)).toEqual(mdast)
  })
})
