import test from 'tape'
import {
  matchZone
} from 'mdast-react-render/lib/utils'

import createEmbedModule from './'
import createParagraphModule from '../paragraph'

const TYPE = 'EMBED'

const embedModule = createEmbedModule({
  TYPE,
  rule: {
    matchMdast: matchZone(TYPE),
    editorOptions: {
      lookupType: 'paragraph'
    }
  },
  subModules: []
})
embedModule.name = 'embed'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: []
})
paragraphModule.name = 'paragraph'

const serializer = embedModule.helpers.serializer

test('embed serialization', assert => {
  const md = `<section><h6>EMBED</h6>

[https://www.youtube.com/watch?v=8bl19RoR7lc](https://www.youtube.com/watch?v=8bl19RoR7lc "https&#x3A;//www.youtube.com/watch?v=8bl19RoR7lc")

<hr /></section>`
  const value = serializer.deserialize(md)
  const embed = value.document.nodes.first()

  assert.equal(embed.kind, 'block')
  assert.equal(embed.type, 'EMBED')

  assert.equal(embed.getIn(['data', 'url']), 'https://www.youtube.com/watch?v=8bl19RoR7lc')
  //
  assert.equal(serializer.serialize(value).trimRight(), md)
  assert.end()
})
