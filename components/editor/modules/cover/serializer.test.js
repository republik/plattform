import test from 'tape'
import createCoverModule from './'
import createHeadlineModule from '../headline'
import createParagraphModule from '../paragraph'

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
  rule: {},
  subModules: [
    titleModule,
    paragraphModule
  ]
})

const serializer = coverModule.helpers.serializer

test('cover serialization', assert => {
  const md = `<section><h6>${TYPE}</h6>

![Alt](img.jpg)

# Title

Lead

<hr /></section>`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, TYPE)

  assert.equal(serializer.serialize(state).trimRight(), md)
  assert.end()
})
