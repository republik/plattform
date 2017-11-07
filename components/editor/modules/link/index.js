import React from 'react'
import { matchInline } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

import createUi from './ui'

export default ({rule, subModules, TYPE}) => {
  const Link = rule.component

  const link = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'inline',
      type: TYPE,
      data: {
        title: node.title,
        href: node.url
      },
      nodes: visitChildren(node)
    }),
    toMdast: (object, index, parent, visitChildren) => ({
      type: 'link',
      title: object.data.title,
      url: object.data.href,
      children: visitChildren(object)
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [
      link
    ]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: createUi({TYPE}),
    plugins: [
      {
        renderNode ({node, children, attributes}) {
          if (!link.match(node)) return
          return (
            <Link data={node.data.toJS()} attributes={attributes}>
              {children}
            </Link>
          )
        }
      }
    ]
  }
}
