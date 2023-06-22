import { matchZone } from '@republik/mdast-react-render'
import { parse, stringify } from '@republik/remark-preset'

import { createEmbedVideoModule, createEmbedTwitterModule } from './'
import createParagraphModule from '../paragraph'

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
    const md = `<section><h6>EMBEDVIDEO</h6>

\`\`\`
{
  "__typename": "VimeoEmbed",
  "id": "242527960",
  "userId": "/users/4801470",
  "userName": "Roman De Giuli",
  "thumbnail": "https://i.vimeocdn.com/video/666449997_960x556.jpg?r=pad"
}
\`\`\`

<https://vimeo.com/channels/staffpicks/242527960>

<hr /></section>`

    const value = embedVideoSerializer.deserialize(parse(md))
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

    expect(stringify(embedVideoSerializer.serialize(value)).trimRight()).toBe(
      md,
    )
  })

  it('embedTwitter serialization', () => {
    const md = `<section><h6>EMBEDTWITTER</h6>

\`\`\`
{
  "__typename": "TwitterEmbed",
  "id": "930363029669203969",
  "text": "Good luck against Argentina later, @alexiwobi https://t.co/mm9us0b7JC",
  "userId": "34613288",
  "userName": "Arsenal FC",
  "userScreenName": "Arsenal"
}
\`\`\`

<https://twitter.com/Arsenal/status/930363029669203969>

<hr /></section>`

    const value = embedTwitterSerializer.deserialize(parse(md))
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

    expect(stringify(embedTwitterSerializer.serialize(value)).trimRight()).toBe(
      md,
    )
  })
})
