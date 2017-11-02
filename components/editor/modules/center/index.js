import { matchBlock } from '../../utils'
import MarkdownSerializer from '../../../../lib/serializer'

export default ({rule, subModules, TYPE}) => {
  const paragraphModule = subModules.find(m => m.name === 'paragraph')
  if (!paragraphModule) {
    throw new Error('Missing paragraph submodule')
  }

  const childSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) => a.concat(
        m.helpers && m.helpers.serializer &&
        m.helpers.serializer.rules
      ),
      []
    ).filter(Boolean)
  })

  const center = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: childSerializer.fromMdast(node.children)
    }),
    toMdast: (object, index, parent, visitChildren, context) => ({
      type: 'zone',
      identifier: TYPE,
      children: childSerializer.toMdast(object.nodes, context)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [
      center
    ]
  })

  const newDocument = ({title}) => serializer.deserialize(`# ${title}\n\n`)

  const Center = rule.component

  return {
    TYPE,
    helpers: {
      serializer,
      newDocument
    },
    changes: {},
    plugins: [
      {
        renderNode ({node, children, attributes}) {
          if (!center.match(node)) return

          return (
            <Center attributes={attributes}>
              {children}
            </Center>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  kinds: ['block'],
                  types: subModules.map(m => m.TYPE)
                }
              ],
              normalize: (change, reason, {node, index, child}) => {
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(
                    child.key,
                    {type: paragraphModule.TYPE}
                  )
                }
                if (reason === 'child_kind_invalid') {
                  change.wrapBlockByKey(
                    child.key,
                    {type: paragraphModule.TYPE}
                  )
                }
              }
            }
          }
        }
      }
    ]
  }
}
