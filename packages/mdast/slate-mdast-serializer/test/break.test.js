import MarkdownSerializer from '../src'
import { parse, stringify } from '@republik/remark-preset'

const serializer = new MarkdownSerializer({
  rules: [
    {
      match: (object) => object.type === 'p',
      matchMdast: (node) => node.type === 'paragraph',
      fromMdast: (node, index, parent, { visitChildren }) => ({
        kind: 'block',
        type: 'p',
        nodes: visitChildren(node),
      }),
      toMdast: (object, index, parent, { visitChildren }) => ({
        type: 'paragraph',
        children: visitChildren(object),
      }),
    },
    {
      match: (object) => object.type === 'b',
      matchMdast: (node) => node.type === 'strong',
      fromMdast: (node, index, parent, { visitChildren }) => ({
        kind: 'mark',
        type: 'b',
        nodes: visitChildren(node),
      }),
      toMdast: (object, index, parent, { visitChildren }) => ({
        type: 'strong',
        children: visitChildren(object),
      }),
    },
    {
      matchMdast: (node) => node.type === 'break',
      fromMdast: () => ({
        kind: 'text',
        leaves: [{ kind: 'leaf', text: '\n', marks: [] }],
      }),
    },
  ],
})

describe('break serialization', () => {
  test('sanity check', () => {
    const md = `A**  
B**
`

    const state = serializer.deserialize(parse(md))
    expect(stringify(serializer.serialize(state))).toEqual(md)
  })
})
