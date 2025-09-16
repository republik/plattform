import { matchZone } from '@republik/mdast-react-render'
import createParagraphModule from '../paragraph'

import { createEmbedTwitterModule, createEmbedVideoModule } from './'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: [],
})
paragraphModule.name = 'paragraph'

const embedVideoModule = createEmbedVideoModule({
  TYPE: 'EMBEDVIDEO',
  rule: {
    matchMdast: matchZone('EMBEDVIDEO'),
    editorOptions: {
      lookupType: 'paragraph',
    },
  },
  subModules: [],
})
embedVideoModule.name = 'embedVideo'

const embedTwitterModule = createEmbedTwitterModule({
  TYPE: 'EMBEDTWITTER',
  rule: {
    matchMdast: matchZone('EMBEDTWITTER'),
    editorOptions: {
      lookupType: 'paragraph',
    },
  },
  subModules: [],
})
embedVideoModule.name = 'embedTwitter'

const embedVideoSerializer = embedVideoModule.helpers.serializer
const embedTwitterSerializer = embedTwitterModule.helpers.serializer

describe('embed serializer test-suite', () => {
  it('embedVideo serialization', () => {
    const mdast = {
      type: 'root',
      children: [
        {
          type: 'zone',
          identifier: 'EMBEDVIDEO',
          data: {
            __typename: 'VimeoEmbed',
            id: '242527960',
            userId: '/users/4801470',
            userName: 'Roman De Giuli',
            thumbnail:
              'https://i.vimeocdn.com/video/666449997_960x556.jpg?r=pad',
          },
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: 'https://vimeo.com/channels/staffpicks/242527960',
                  children: [
                    {
                      type: 'text',
                      value: 'https://vimeo.com/channels/staffpicks/242527960',
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

    const value = embedVideoSerializer.deserialize(mdast)
    const embed = value.document.nodes.first()

    expect(embed.kind).toBe('block')
    expect(embed.type).toBe('EMBEDVIDEO')

    expect(embed.data.toJS()).toEqual({
      __typename: 'VimeoEmbed',
      id: '242527960',
      userId: '/users/4801470',
      userName: 'Roman De Giuli',
      thumbnail: 'https://i.vimeocdn.com/video/666449997_960x556.jpg?r=pad',
      url: 'https://vimeo.com/channels/staffpicks/242527960',
    })

    expect(embedVideoSerializer.serialize(value)).toEqual(mdast)
  })

  it('embedTwitter serialization', () => {
    const mdast = {
      type: 'root',
      children: [
        {
          type: 'zone',
          identifier: 'EMBEDTWITTER',
          data: {
            __typename: 'TwitterEmbed',
            id: '930363029669203969',
            text: 'Good luck against Argentina later, @alexiwobi https://t.co/mm9us0b7JC',
            userId: '34613288',
            userName: 'Arsenal FC',
            userScreenName: 'Arsenal',
          },
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'link',
                  url: 'https://twitter.com/Arsenal/status/930363029669203969',
                  children: [
                    {
                      type: 'text',
                      value:
                        'https://twitter.com/Arsenal/status/930363029669203969',
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

    const value = embedTwitterSerializer.deserialize(mdast)
    const embed = value.document.nodes.first()

    expect(embed.kind).toBe('block')
    expect(embed.type).toBe('EMBEDTWITTER')

    expect(embed.data.toJS()).toEqual({
      __typename: 'TwitterEmbed',
      id: '930363029669203969',
      text: 'Good luck against Argentina later, @alexiwobi https://t.co/mm9us0b7JC',
      userId: '34613288',
      userName: 'Arsenal FC',
      userScreenName: 'Arsenal',
      url: 'https://twitter.com/Arsenal/status/930363029669203969',
    })

    expect(embedTwitterSerializer.serialize(value)).toEqual(mdast)
  })
})
