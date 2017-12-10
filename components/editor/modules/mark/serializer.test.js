import test from 'tape'
import createMarkModule from './'
import createParagraphModule from '../paragraph'
import { parse, stringify } from '@orbiting/remark-preset'

const boldModule = createMarkModule({
  TYPE: 'STRONG',
  rule: {
    matchMdast: node => node.type === 'strong',
    editorOptions: {
      type: 'strong'
    }
  },
  subModules: []
})
const emphasisModule = createMarkModule({
  TYPE: 'EMPHASIS',
  rule: {
    matchMdast: node => node.type === 'emphasis',
    editorOptions: {
      type: 'emphasis'
    }
  },
  subModules: []
})
const deleteModule = createMarkModule({
  TYPE: 'DELETE',
  rule: {
    matchMdast: node => node.type === 'delete',
    editorOptions: {
      type: 'delete'
    }
  },
  subModules: []
})

const paragraphModule = createParagraphModule({
  TYPE: 'P',
  rule: {},
  subModules: [boldModule, emphasisModule, deleteModule]
})
paragraphModule.name = 'paragraph'

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
