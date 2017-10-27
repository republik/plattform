import { matchBlock } from '../../utils'
import MarkdownSerializer from '../../../../lib/serializer'
import { getSerializationRules } from '../../utils/getRules'
import addValidation from '../../utils/serializationValidation'

import figure from '../figure'
import list from '../list'
import special from '../special'

export default ({rule, subModules, TYPE}) => {
  const paragraphModule = subModules.find(m => m.identifier === 'PARAGRAPH')
  if (!paragraphModule) {
    throw new Error('Missing PARAGRAPH submodule')
  }

  const childSerializer = new MarkdownSerializer({
    rules: getSerializationRules(
      subModules.reduce(
        (a, m) => a.concat(m.plugins),
        []
      ).concat([
        ...figure.plugins,
        ...list.plugins,
        ...special.plugins
      ])
    )
  })

  const center = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'zone' && node.identifier === TYPE,
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: childSerializer.fromMdast(node.children)
    }),
    toMdast: (object, index, parent, visitChildren, context) => ({
      type: 'zone',
      identifier: TYPE,
      children: childSerializer.toMdast(object.nodes, context)
    }),
    render: rule.component
  }

  const serializer = new MarkdownSerializer({
    rules: [
      center
    ]
  })

  addValidation(center, serializer, 'center')

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
                const notBlocks = node.nodes.filter(n => n.kind !== 'block')

                return notBlocks.size
                  ? notBlocks
                  : null
              },
              normalize: (change, object, notBlocks) => {
                notBlocks.forEach((child) => {
                  change.wrapBlockByKey(child.key, paragraphModule.TYPE)
                })

                return change
              }
            },
            center
          ]
        }
      }
    ]
  }
}
