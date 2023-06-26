import { paragraphModule } from './testUtils'
import { parse, stringify } from '@republik/remark-preset'

const serializer = paragraphModule.helpers.serializer

describe('mark serialization test-suite', () => {
  it('mark serialization', () => {
    const md = `_Hello_ ~~World~~**You**`
    const value = serializer.deserialize(parse(md))
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

    expect(stringify(serializer.serialize(value)).trimRight()).toBe(md)
  })

  test('mark subsup serialization', () => {
    const md = 'CO<sub>2eq</sub> 40 µg/m<sup>3</sup>\n'
    const value = serializer.deserialize(parse(md))

    expect(stringify(serializer.serialize(value))).toBe(md)
  })
})
