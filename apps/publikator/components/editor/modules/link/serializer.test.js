import { parse, stringify } from '@republik/remark-preset'

import createLinkModule from './'
import createParagraphModule from '../paragraph'

const linkModule = createLinkModule({
  TYPE: 'LINK',
  rule: {
    matchMdast: (node) => node.type === 'link',
  },
  subModules: [],
})
linkModule.name = 'link'

const paragraphModule = createParagraphModule({
  TYPE: 'PARAGRAPH',
  rule: {},
  subModules: [linkModule],
})
paragraphModule.name = 'paragraph'

const serializer = paragraphModule.helpers.serializer

describe('link serializer test-suite', () => {
  it('link serialization', () => {
    const value = serializer.deserialize(parse('[Test](example.com)'))
    const node = value.document.nodes.first()

    expect(node.kind).toBe('block')
    expect(node.type).toBe('PARAGRAPH')
    expect(node.text).toBe('Test')

    const link = node.nodes.find((node) => node.type === 'LINK')
    expect(link).toBeTruthy()

    expect(link.getIn(['data', 'href'])).toBe('example.com')

    expect(stringify(serializer.serialize(value)).trimRight()).toBe(
      '[Test](example.com)',
    )
  })
})
