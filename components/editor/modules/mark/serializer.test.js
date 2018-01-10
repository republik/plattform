import test from 'tape'
import { paragraphModule } from './testUtils'
import { parse, stringify } from '@orbiting/remark-preset'

const serializer = paragraphModule.helpers.serializer

test('mark serialization', assert => {
  const md = `_Hello_ ~~World~~**You**`
  const value = serializer.deserialize(parse(md))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'P')

  assert.equal(node.text, 'Hello WorldYou')

  const textKey = node.getFirstText().key
  const helloMarks = value
    .change()
    .select({
      anchorKey: textKey,
      anchorOffset: 0,
      focusKey: textKey,
      focusOffset: 4
    })
    .value
    .marks
  assert.equal(helloMarks.size, 1)
  assert.equal(helloMarks.first().type, 'EMPHASIS')

  const worldMarks = value
    .change()
    .select({
      anchorKey: textKey,
      anchorOffset: 5,
      focusKey: textKey,
      focusOffset: 10
    })
    .value
    .marks
  assert.equal(worldMarks.size, 1)
  assert.equal(worldMarks.first().type, 'DELETE')

  const youMarks = value
    .change()
    .select({
      anchorKey: textKey,
      anchorOffset: 11,
      focusKey: textKey,
      focusOffset: 13
    })
    .value
    .marks
  assert.equal(youMarks.size, 1)
  assert.equal(youMarks.first().type, 'STRONG')

  assert.equal(stringify(serializer.serialize(value)).trimRight(), md)
  assert.end()
})

test('mark subsup serialization', assert => {
  const md = 'CO<sub>2eq</sub> 40 µg/m<sup>3</sup>\n'
  const value = serializer.deserialize(parse(md))

  assert.equal(stringify(serializer.serialize(value)), md)
  assert.end()
})
