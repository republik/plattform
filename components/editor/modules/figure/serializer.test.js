import test from 'tape'
import createFigureModule from './'
import createImageModule from './image'
import createCaptionModule from './caption'
import { parse, stringify } from '@orbiting/remark-preset'

const TYPE = 'FIGURE'

const imageModule = createImageModule({
  TYPE: 'FIGURE_IMAGE',
  rule: {
    editorOptions: {
      depth: 1
    }
  },
  subModules: []
})
imageModule.name = 'figureImage'

const captionModule = createCaptionModule({
  TYPE: 'FIGURE_CAPTION',
  rule: {
    matchMdast: node => node.type === 'paragraph'
  },
  subModules: []
})
captionModule.name = 'figureCaption'

const figureModule = createFigureModule({
  TYPE,
  rule: {
    matchMdast: node => node.type === 'zone' && node.identifier === TYPE
  },
  subModules: [
    imageModule,
    captionModule
  ]
})

const serializer = figureModule.helpers.serializer

test('figure serialization', assert => {
  const md = `<section><h6>${TYPE}</h6>

![Alt](example.com/img.jpg)

Caption

<hr /></section>`
  const value = serializer.deserialize(parse(md))
  const node = value.document.nodes.first()

  const image = node.nodes.first()
  assert.equal(image.kind, 'block')
  assert.equal(image.type, 'FIGURE_IMAGE')

  assert.equal(image.getIn(['data', 'src']), 'example.com/img.jpg')
  assert.equal(image.getIn(['data', 'alt']), 'Alt')

  const caption = node.nodes.get(1)
  assert.equal(caption.kind, 'block')
  assert.equal(caption.type, 'FIGURE_CAPTION')
  assert.equal(caption.text, 'Caption')

  assert.equal(stringify(serializer.serialize(value)).trimRight(), md)
  assert.end()
})
