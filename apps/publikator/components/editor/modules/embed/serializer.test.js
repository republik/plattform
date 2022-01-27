import test from 'tape'
import { matchZone } from 'mdast-react-render/lib/utils'
import { parse, stringify } from '@orbiting/remark-preset'

import { createEmbedVideoModule, createEmbedTwitterModule } from './'
import createParagraphModule from '../paragraph'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: []
})
paragraphModule.name = 'paragraph'

const embedVideoModule = createEmbedVideoModule({
  TYPE: 'EMBEDVIDEO',
  rule: {
    matchMdast: matchZone('EMBEDVIDEO'),
    editorOptions: {
      lookupType: 'paragraph'
    }
  },
  subModules: []
})
embedVideoModule.name = 'embedVideo'

const embedTwitterModule = createEmbedTwitterModule({
  TYPE: 'EMBEDTWITTER',
  rule: {
    matchMdast: matchZone('EMBEDTWITTER'),
    editorOptions: {
      lookupType: 'paragraph'
    }
  },
  subModules: []
})
embedVideoModule.name = 'embedTwitter'

const embedVideoSerializer = embedVideoModule.helpers.serializer
const embedTwitterSerializer = embedTwitterModule.helpers.serializer

test('embedVideo serialization', assert => {
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

  assert.equal(embed.kind, 'block')
  assert.equal(embed.type, 'EMBEDVIDEO')

  assert.deepEqual(embed.data.toJS(), {
    __typename: 'VimeoEmbed',
    id: '242527960',
    userId: '/users/4801470',
    userName: 'Roman De Giuli',
    thumbnail: 'https://i.vimeocdn.com/video/666449997_960x556.jpg?r=pad',
    url: 'https://vimeo.com/channels/staffpicks/242527960'
  })

  assert.equal(stringify(embedVideoSerializer.serialize(value)).trimRight(), md)
  assert.end()
})

test('embedTwitter serialization', assert => {
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

  assert.equal(embed.kind, 'block')
  assert.equal(embed.type, 'EMBEDTWITTER')

  assert.deepEqual(embed.data.toJS(), {
    __typename: 'TwitterEmbed',
    id: '930363029669203969',
    text:
      'Good luck against Argentina later, @alexiwobi https://t.co/mm9us0b7JC',
    userId: '34613288',
    userName: 'Arsenal FC',
    userScreenName: 'Arsenal',
    url: 'https://twitter.com/Arsenal/status/930363029669203969'
  })

  assert.equal(
    stringify(embedTwitterSerializer.serialize(value)).trimRight(),
    md
  )
  assert.end()
})
