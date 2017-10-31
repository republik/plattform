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
    })
  }

  const ListItem = rule.component

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
        renderNode: ({node, attributes, children}) => {
          if (node.type !== TYPE) return
          return (
            <ListItem {...attributes}>
              {children}
            </ListItem>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [{ types: [PARAGRAPH] }],
              normalize: (change, reason, { node, child }) => {
                if (reason === 'child_type_invalid') {
                  if (reason === 'child_type_invalid') {
                    if (child.kind === 'block') {
                      change.setNodeByKey(child.key, PARAGRAPH)
                    } else {
                      change.wrapBlockByKey(child.key, PARAGRAPH)
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
}
