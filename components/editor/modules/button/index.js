import React from 'react'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'
import { createStaticKeyHandler } from '../../utils/keyHandlers'

import createUi from './ui'

export default ({ rule, subModules, TYPE }) => {
  const inlineSerializer = new MarkdownSerializer({
    rules: subModules.reduce(
      (a, m) =>
        a.concat(
          m.helpers && m.helpers.serializer && m.helpers.serializer.rules
        ),
      []
    )
  })

  const schemaRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, rest) => {
      const link = (node.children[0] && node.children[0].children[0]) || {}

      return {
        kind: 'block',
        type: TYPE,
        data: {
          ...node.data,
          href: link.url,
          title: link.title
        },
        nodes: inlineSerializer.fromMdast(link.children || [], 0, node, rest)
      }
    },
    toMdast: (object, index, parent, rest) => {
      const { href, title, ...data } = object.data

      return {
        type: 'zone',
        identifier: 'BUTTON',
        data,
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: href,
                title,
                children: inlineSerializer.toMdast(
                  object.nodes,
                  0,
                  object,
                  rest
                )
              }
            ]
          }
        ]
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [schemaRule]
  })

  const Component = rule.component

  const staticHandle = createStaticKeyHandler({
    TYPE: TYPE,
    rule: { editorOptions: {} }
  })

  return {
    TYPE,
    rule,
    helpers: {
      serializer
    },
    changes: {},
    ui: createUi({ TYPE }),
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!schemaRule.match(node)) return

          return (
            <Component {...node.data.toJS()} attributes={attributes}>
              {children}
            </Component>
          )
        },
        onKeyDown: (...args) => {
          const [event] = args

          const isEnter = event.key === 'Enter'
          if (isEnter) return staticHandle(...args)
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  kinds: ['inline', 'text']
                }
              ],
              normalize: (change, reason, { node, index, child }) => {
                if (reason === 'child_kind_invalid') {
                  change.unwrapBlockByKey(child.key)
                }
              }
            }
          }
        }
      }
    ]
  }
}
