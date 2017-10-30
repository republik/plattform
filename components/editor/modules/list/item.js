import MarkdownSerializer from '../../../../lib/serializer'
import { matchBlock } from '../../utils'

export default ({rule, subModules, TYPE}) => {
  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }
  const paragraphSerializer = paragraphModule.helpers.serializer
  const PARAGRAPH = paragraphModule.TYPE

  const listItem = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'listItem',
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: paragraphSerializer.fromMdast(node.children)
    }),
    toMdast: (object, index, parent, visitChildren) => ({
      type: 'listItem',
      children: paragraphSerializer.toMdast(object.nodes)
    }),
    render: rule.component
  }

  const serializer = new MarkdownSerializer({
    rules: [
      listItem
    ]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    plugins: [
      {
        schema: {
          rules: [
            {
              match: matchBlock(TYPE),
              validate: node => {
                const notParagraphs = node.nodes
                  .filter(n => n.type !== PARAGRAPH)

                return notParagraphs.size
                  ? notParagraphs
                  : null
              },
              normalize: (change, object, notParagraphs) => {
                notParagraphs.forEach(child => {
                  if (child.kind === 'block') {
                    change.unwrapNodeByKey(child.key)
                  } else {
                    change.wrapBlockByKey(child.key, PARAGRAPH)
                  }
                })

                return change
              }
            },
            listItem
          ]
        }
      }
    ]
  }
}
