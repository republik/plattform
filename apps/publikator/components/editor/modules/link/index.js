import React from 'react'
import { matchInline } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

import createUi from './ui'

export default ({ rule, subModules, TYPE }) => {
  const Link = rule.component
  const { formatTypes } = rule.editorOptions || {}

  const link = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren, context }) => ({
      kind: 'inline',
      type: TYPE,
      data: {
        title: node.title,
        href: node.url,
        color: context.color
      },
      nodes: visitChildren(node)
    }),
    toMdast: (object, index, parent, { visitChildren }) => ({
      type: 'link',
      title: object.data.title,
      url: object.data.href,
      children: visitChildren(object)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [link]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: createUi({ TYPE, parentTypes: formatTypes }),
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!link.match(node)) return
          return (
            <Link {...node.data.toJS()} attributes={attributes}>
              {children}
            </Link>
          )
        }
      }
    ]
  }
}
