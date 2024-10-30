import MarkdownSerializer from '@republik/slate-mdast-serializer'

import { matchBlock } from '../../utils'
import createUi from './ui'
import { matchAncestor } from '../../utils/matchers'
import InlineUI from '../../utils/InlineUI'

export default ({ rule, subModules, TYPE }) => {
  const editorOptions = rule.editorOptions || {}

  const numberModule = subModules.find((m) => m.name === 'paragraph')
  const captionModule = subModules.find(
    (m) => m.name === 'paragraph' && m !== numberModule,
  )

  const orderedSubModules = [
    numberModule,
    captionModule,
  ]

  const childSerializer = new MarkdownSerializer({
    rules: orderedSubModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules,
          ),
        [],
      )
      .filter(Boolean),
  })

  const Container = rule.component

  const serializerRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      return {
        kind: 'block',
        type: TYPE,
        data: node.data,
        nodes: childSerializer.fromMdast(node.children, 0, node, rest),
      }
    },
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'zone',
        identifier: TYPE,
        data: object.data,
        children: childSerializer.toMdast(object.nodes, 0, object, rest),
      }
    },
  }

  const serializer = new MarkdownSerializer({
    rules: [serializerRule],
  })

  return {
    TYPE,
    helpers: {
      serializer,
    },
    changes: {},
    ui: createUi({
      TYPE,
      subModules: orderedSubModules,
      editorOptions,
    }),
    plugins: [
      {
        renderNode({ node, children, attributes, editor }) {
          if (!serializerRule.match(node)) return

          return (
            <Container
              attributes={attributes}
              {...node.data.toJS()}
            >
              <InlineUI
                node={node}
                editor={editor}
                isMatch={matchAncestor(TYPE)}
              />
              {children}
            </Container>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  kinds: ['block'],
                  types: [numberModule.TYPE],
                  min: 1,
                  max: 1,
                },
                {
                  kinds: ['block'],
                  types: [captionModule.TYPE],
                  min: 1,
                  max: 1,
                },
              ],
            },
          },
        },
      },
    ],
  }
}
