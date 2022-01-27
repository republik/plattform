import test from 'tape'
import createCoverModule from './'
import createHeadlineModule from '../headline'
import createParagraphModule from '../paragraph'
import { parse, stringify } from '@orbiting/remark-preset'

const TYPE = 'COVER'

const titleModule = createHeadlineModule({
  TYPE: 'TITLE',
  rule: {
    editorOptions: {
      depth: 1
    }
  },
  subModules: []
})
titleModule.name = 'headline'

const paragraphModule = createParagraphModule({
  TYPE: 'LEAD',
  rule: {},
  subModules: []
})
paragraphModule.name = 'paragraph'

const coverModule = createCoverModule({
  TYPE,
  rule: {
    matchMdast: node => node.type === 'zone' && node.identifier === TYPE
  },
  subModules: [titleModule, paragraphModule]
})

const serializer = coverModule.helpers.serializer

test('cover serialization', assert => {
  const md = `<section><h6>${TYPE}</h6>

![Alt](img.jpg)

# Title

Lead

<hr /></section>`
  const value = serializer.deserialize(parse(md))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, TYPE)

  assert.equal(stringify(serializer.serialize(value)).trimRight(), md)
  assert.end()
})
