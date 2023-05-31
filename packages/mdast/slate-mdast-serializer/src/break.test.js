import test from 'tape'
import MarkdownSerializer from './'
import { parse, stringify } from '@orbiting/remark-preset'

const serializer = new MarkdownSerializer({
  rules: [
    {
      match: object => object.type === 'p',
      matchMdast: (node) => node.type === 'paragraph',
      fromMdast: (node, index, parent, {visitChildren}) => ({
        kind: 'block',
        type: 'p',
        nodes: visitChildren(node)
      }),
      toMdast: (object, index, parent, {visitChildren}) => ({
        type: 'paragraph',
        children: visitChildren(object)
      })
    },
    {
      match: object => object.type === 'b',
      matchMdast: (node) => node.type === 'strong',
      fromMdast: (node, index, parent, {visitChildren}) => ({
        kind: 'mark',
        type: 'b',
        nodes: visitChildren(node)
      }),
      toMdast: (object, index, parent, {visitChildren}) => ({
        type: 'strong',
        children: visitChildren(object)
      })
    },
    {
      matchMdast: (node) => node.type === 'break',
      fromMdast: () => ({
        kind: 'text',
        leaves: [{kind: 'leaf', text: '\n', marks: []}],
      })
    }
  ]
})


test('mark with a break', assert => {
  const md = `A**  
B**
`

  const state = serializer.deserialize(parse(md))
  const node = state.document.nodes.first()

  assert.equal(stringify(serializer.serialize(state)), md)

  assert.end()
})
