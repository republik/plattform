import React from 'react'
import { matchInline } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'
import { colors } from '@project-r/styleguide'

import createUi from './ui'

export default ({ rule, subModules, TYPE }) => {
  const { editorOptions } = rule
  const Component = rule.component

  const serializerRule = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren, context }) => ({
      kind: 'inline',
      type: TYPE,
      data: {
        variable: node.data.variable
      },
      isVoid: true,
      nodes: []
    }),
    toMdast: (object, index, parent, { visitChildren }) => ({
      type: 'span',
      data: {
        variable: object.data.variable
      },
      children: []
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [serializerRule]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: createUi({ TYPE, editorOptions }),
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!serializerRule.match(node)) return
          const data = node.data.toJS()
          return (
            <span
              attributes={attributes}
              style={{ backgroundColor: colors.primaryBg }}
            >
              <Component {...data} fallback={`{${data.variable}}`} />
            </span>
          )
        },
        schema: {
          inlines: {
            [TYPE]: {
              isVoid: true
            }
          }
        }
      }
    ]
  }
}
