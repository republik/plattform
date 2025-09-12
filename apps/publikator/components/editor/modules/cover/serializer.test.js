import createHeadlineModule from '../headline'
import createParagraphModule from '../paragraph'
import createCoverModule from './'

const TYPE = 'COVER'

const titleModule = createHeadlineModule({
  TYPE: 'TITLE',
  rule: {
    editorOptions: {
      depth: 1,
    },
  },
  subModules: [],
})
titleModule.name = 'headline'

const paragraphModule = createParagraphModule({
  TYPE: 'LEAD',
  rule: {},
  subModules: [],
})
paragraphModule.name = 'paragraph'

const coverModule = createCoverModule({
  TYPE,
  rule: {
    matchMdast: (node) => node.type === 'zone' && node.identifier === TYPE,
  },
  subModules: [titleModule, paragraphModule],
})

const serializer = coverModule.helpers.serializer

const mdast = {
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'COVER',
      data: {},
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              title: null,
              url: 'img.jpg',
              alt: 'Alt',
            },
          ],
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Title',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Lead',
            },
          ],
        },
      ],
    },
  ],
  meta: {},
}

const mdastNormalised = {
  type: 'root',
  children: [
    {
      type: 'zone',
      identifier: 'COVER',
      children: [
        {
          type: 'image',
          url: 'img.jpg',
          alt: 'Alt',
        },
        {
          type: 'heading',
          depth: 1,
          children: [
            {
              type: 'text',
              value: 'Title',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'Lead',
            },
          ],
        },
      ],
    },
  ],
  meta: {},
}

describe('cover serializer test-suite', () => {
  it('cover serialization', () => {
    const value = serializer.deserialize(mdast)
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe(TYPE)

    expect(serializer.serialize(value)).toEqual(mdastNormalised)
  })
})
