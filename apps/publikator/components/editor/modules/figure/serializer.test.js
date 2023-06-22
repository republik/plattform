import createFigureModule from './'
import createImageModule from './image'
import createParagraphModule from '../paragraph'
import createCaptionModule from './caption'
import { parse, stringify } from '@republik/remark-preset'
import { boldModule } from '../mark/testUtils'

const TYPE = 'FIGURE'

const imageModule = createImageModule({
  TYPE: 'FIGURE_IMAGE',
  rule: {
    matchMdast: (node) =>
      node.type === 'paragraph' &&
      node.children.length === 3 &&
      node.children[0].type === 'image',
    editorOptions: {
      depth: 1,
    },
  },
  subModules: [],
})
imageModule.name = 'figureImage'

const bylineModule = createParagraphModule({
  TYPE: 'EMPHASIS',
  rule: {
    matchMdast: (node) => node.type === 'emphasis',
  },
  subModules: [],
})

const captionModule = createCaptionModule({
  TYPE: 'FIGURE_CAPTION',
  rule: {
    matchMdast: (node) => node.type === 'paragraph',
    editorOptions: {},
  },
  subModules: [bylineModule, boldModule],
})
captionModule.name = 'figureCaption'

const figureModule = createFigureModule({
  TYPE,
  rule: {
    matchMdast: (node) => node.type === 'zone' && node.identifier === TYPE,
    editorOptions: {},
  },
  subModules: [imageModule, captionModule],
})

const serializer = figureModule.helpers.serializer

describe('figure serializer test-suite', () => {
  it('figure serialization', () => {
    const md = `<section><h6>${TYPE}</h6>

\`\`\`
{
  "excludeFromGallery": false
}
\`\`\`

![Alt](example.com/img.jpg) ![Alt](example.com/img-dark.jpg)

Caption_Byline_

<hr /></section>`
    const value = serializer.deserialize(parse(md))
    const node = value.document.nodes.first()
    expect(node.getIn(['data', 'excludeFromGallery'])).toBe(false)
    const image = node.nodes.first()
    expect(image.kind).toBe('block')
    expect(image.type).toBe('FIGURE_IMAGE')
    expect(image.getIn(['data', 'src'])).toBe('example.com/img.jpg')
    const caption = node.nodes.get(1)
    expect(caption.kind).toBe('block')
    expect(caption.type).toBe('FIGURE_CAPTION')
    expect(stringify(serializer.serialize(value)).trimRight()).toBe(md)
  })

  it('figure caption with break in mark', () => {
    const serializer = captionModule.helpers.serializer

    const md = `A**${'  '}
B**_Caption_
`
    const value = serializer.deserialize(parse(md))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('FIGURE_CAPTION')
    expect(stringify(serializer.serialize(value))).toBe(md)
  })
})
