import test from 'tape'
import createParagraphModule from './'
import { parse, stringify } from '@orbiting/remark-preset'
import { boldModule } from '../mark/testUtils'

test('paragraph serialization', assert => {
  const paragraphModule = createParagraphModule({
    TYPE: 'P',
    rule: {},
    subModules: []
  })

  const serializer = paragraphModule.helpers.serializer

  const value = serializer.deserialize(parse('Test'))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'P')
  assert.equal(node.text, 'Test')

  assert.equal(stringify(serializer.serialize(value)).trimRight(), 'Test')
  assert.end()
})

test('paragraph with break in mark', assert => {
  const paragraphModule = createParagraphModule({
    TYPE: 'P',
    rule: {},
    subModules: [boldModule]
  })

  const serializer = paragraphModule.helpers.serializer

  const md = `A**${'  '}
B**
`
  const value = serializer.deserialize(parse(md))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'P')
  assert.equal(node.text, 'A\nB')

  assert.equal(stringify(serializer.serialize(value)), md)
  assert.end()
})

test('paragraph with mdastPlaceholder', assert => {
  const paragraphModule = createParagraphModule({
    TYPE: 'P',
    rule: {
      editorOptions: {
        mdastPlaceholder: '\u2063'
      }
    },
    subModules: []
  })

  const serializer = paragraphModule.helpers.serializer

  const md = `\u2063
`
  const value = serializer.deserialize(parse(md))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'P')
  assert.equal(node.text, String())

  assert.equal(stringify(serializer.serialize(value)), md)
  assert.end()
})
