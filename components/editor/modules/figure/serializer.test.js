import test from 'tape'
import createFigureModule from './'
import createImageModule from './image'
import createParagraphModule from '../paragraph'
import createCaptionModule from './caption'
import { parse, stringify } from '@orbiting/remark-preset'
import { boldModule } from '../mark/testUtils'

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

const bylineModule = createParagraphModule({
  TYPE: 'EMPHASIS',
  rule: {
    matchMdast: node => node.type === 'emphasis'
  },
  subModules: []
})

const captionModule = createCaptionModule({
  TYPE: 'FIGURE_CAPTION',
  rule: {
    matchMdast: node => node.type === 'paragraph',
    editorOptions: {}
  },
  subModules: [bylineModule, boldModule]
})
captionModule.name = 'figureCaption'

const figureModule = createFigureModule({
  TYPE,
  rule: {
    matchMdast: node => node.type === 'zone' && node.identifier === TYPE,
    editorOptions: {}
  },
  subModules: [imageModule, captionModule]
})

const serializer = figureModule.helpers.serializer

test('figure serialization', assert => {
  const md = `<section><h6>${TYPE}</h6>

\`\`\`
{
  "excludeFromGallery": false
}
\`\`\`

![Alt](example.com/img.jpg)

Caption_Byline_

<hr /></section>`
  const value = serializer.deserialize(parse(md))
  const node = value.document.nodes.first()
  assert.equal(node.getIn(['data', 'excludeFromGallery']), false)

  const image = node.nodes.first()
  assert.equal(image.kind, 'block')
  assert.equal(image.type, 'FIGURE_IMAGE')

  assert.equal(image.getIn(['data', 'src']), 'example.com/img.jpg')
  assert.equal(image.getIn(['data', 'alt']), 'Alt')

  const caption = node.nodes.get(1)
  assert.equal(caption.kind, 'block')
  assert.equal(caption.type, 'FIGURE_CAPTION')
  assert.equal(caption.text, 'CaptionByline')

  assert.equal(stringify(serializer.serialize(value)).trimRight(), md)
  assert.end()
})

test('figure caption with break in mark', assert => {
  const serializer = captionModule.helpers.serializer

  const md = `A**${'  '}
B**_Caption_
`
  const value = serializer.deserialize(parse(md))
  const node = value.document.nodes.first()

  assert.equal(node.kind, 'block')
  assert.equal(node.type, 'FIGURE_CAPTION')
  assert.equal(node.text, 'A\nBCaption')

  assert.equal(stringify(serializer.serialize(value)), md)
  assert.end()
})
