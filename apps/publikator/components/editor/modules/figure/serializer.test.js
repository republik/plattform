import { boldModule } from '../mark/testUtils'
import createParagraphModule from '../paragraph'
import createFigureModule from './'
import createCaptionModule from './caption'
import createImageModule from './image'

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

const figureMdast = {
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'FIGURE',
      data: {
        excludeFromGallery: false,
        captionRight: undefined,
        float: undefined,
        plain: undefined,
        size: undefined,
      },
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              url: 'example.com/img.jpg',
              alt: 'Alt',
            },
            {
              type: 'text',
              value: ' ',
            },
            {
              type: 'image',
              url: 'example.com/img-dark.jpg',
              alt: 'Alt',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Caption',
            },
            {
              type: 'emphasis',
              children: [
                {
                  type: 'text',
                  value: 'Byline',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  meta: {},
}

const captionMdast = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'A',
        },
        {
          type: 'strong',
          children: [
            {
              type: 'break',
            },
            {
              type: 'text',
              value: 'B',
            },
          ],
        },
        {
          type: 'emphasis',
          children: [
            {
              type: 'text',
              value: 'Caption',
            },
          ],
        },
      ],
    },
  ],
  meta: {},
}

const captionMdastNormalised = {
  type: 'root',
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'A',
        },
        {
          type: 'strong',
          children: [
            // added empty text block
            {
              type: 'text',
              value: '',
            },
            {
              type: 'break',
            },
            {
              type: 'text',
              value: 'B',
            },
          ],
        },
        {
          type: 'emphasis',
          children: [
            {
              type: 'text',
              value: 'Caption',
            },
          ],
        },
      ],
    },
  ],
  meta: {},
}

describe('figure serializer test-suite', () => {
  it('figure serialization', () => {
    const value = serializer.deserialize(figureMdast)
    const node = value.document.nodes.first()
    expect(node.getIn(['data', 'excludeFromGallery'])).toBe(false)
    const image = node.nodes.first()
    expect(image.kind).toBe('block')
    expect(image.type).toBe('FIGURE_IMAGE')
    expect(image.getIn(['data', 'src'])).toBe('example.com/img.jpg')
    const caption = node.nodes.get(1)
    expect(caption.kind).toBe('block')
    expect(caption.type).toBe('FIGURE_CAPTION')
    expect(serializer.serialize(value)).toEqual(figureMdast)
  })

  it('figure caption with break in mark', () => {
    const serializer = captionModule.helpers.serializer

    const value = serializer.deserialize(captionMdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('FIGURE_CAPTION')
    expect(serializer.serialize(value)).toEqual(captionMdastNormalised)
  })
})
