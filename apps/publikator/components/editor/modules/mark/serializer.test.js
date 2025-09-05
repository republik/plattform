import { paragraphModule } from './testUtils'

const serializer = paragraphModule.helpers.serializer

describe('mark serialization test-suite', () => {
  it('mark serialization', () => {
    const mdast = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'emphasis',
              children: [
                {
                  type: 'text',
                  value: 'Hello',
                },
              ],
            },
            {
              type: 'text',
              value: ' ',
            },
            {
              type: 'delete',
              children: [
                {
                  type: 'text',
                  value: 'World',
                },
              ],
            },
            {
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: 'You',
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

    expect(node.text).toBe('Hello WorldYou')

    const textKey = node.getFirstText().key
    const helloMarks = value.change().select({
      anchorKey: textKey,
      anchorOffset: 0,
      focusKey: textKey,
      focusOffset: 4,
    }).value.marks
    expect(helloMarks.size).toBe(1)
    expect(helloMarks.first().type).toBe('EMPHASIS')

    const worldMarks = value.change().select({
      anchorKey: textKey,
      anchorOffset: 5,
      focusKey: textKey,
      focusOffset: 10,
    }).value.marks
    expect(worldMarks.size).toBe(1)
    expect(worldMarks.first().type).toBe('DELETE')

    const youMarks = value.change().select({
      anchorKey: textKey,
      anchorOffset: 11,
      focusKey: textKey,
      focusOffset: 13,
    }).value.marks
    expect(youMarks.size).toBe(1)
    expect(youMarks.first().type).toBe('STRONG')

    expect(serializer.serialize(value)).toEqual(mdast)
  })

  test('mark subsup serialization', () => {
    const mdast = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'CO',
            },
            {
              type: 'sub',
              children: [
                {
                  type: 'text',
                  value: '2eq',
                },
              ],
            },
            {
              type: 'text',
              value: ' 40 µg/m',
            },
            {
              type: 'sup',
              children: [
                {
                  type: 'text',
                  value: '3',
                },
              ],
            },
          ],
        },
      ],
      meta: {},
    }

    const value = serializer.deserialize(mdast)

    expect(serializer.serialize(value)).toEqual(mdast)
  })
})
