import test from 'tape'
import createFigureModule from './'
import createImageModule from './image'
import createParagraphModule from '../paragraph'

const TYPE = 'FIGURE'

const imageModule = createImageModule({
  TYPE: 'FIGURE_IMAGE',
  rule: {
    options: {
      depth: 1
    }
  },
  subModules: []
})
imageModule.identifier = 'FIGURE_IMAGE'

const paragraphModule = createParagraphModule({
  TYPE: 'FIGURE_CAPTION',
  rule: {},
  subModules: []
})
paragraphModule.identifier = 'FIGURE_CAPTION'

const figureModule = createFigureModule({
  TYPE,
  rule: {},
  subModules: [
    imageModule,
    paragraphModule
  ]
})

const serializer = figureModule.helpers.serializer

test('figure serialization', assert => {
  const md = `<section><h6>${TYPE}</h6>

![Alt](example.com/img.jpg)

Caption

<hr /></section>`
  const state = serializer.deserialize(md)
  const node = state.document.nodes.first()

  const image = node.nodes.first()
  assert.equal(image.kind, 'block')
  assert.equal(image.type, 'FIGURE_IMAGE')

  assert.equal(image.getIn(['data', 'src']), 'example.com/img.jpg')
  assert.equal(image.getIn(['data', 'alt']), 'Alt')

  const caption = node.nodes.get(1)
  assert.equal(caption.kind, 'block')
  assert.equal(caption.type, 'FIGURE_CAPTION')
  assert.equal(caption.text, 'Caption')

  assert.equal(serializer.serialize(state).trimRight(), md)
  assert.end()
})
