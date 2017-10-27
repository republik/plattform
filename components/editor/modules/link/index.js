import React from 'react'
import { matchInline } from '../../utils'

import createUi from './ui'

export default ({rule, subModules, TYPE}) => {
  const Link = rule.component

  const link = {
    match: matchInline(TYPE),
    matchMdast: (node) => node.type === 'link',
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
    }),
    render: ({ children, node, attributes }) => (
      <Link data={node.data.toJS()} attributes={attributes}>
        {children}
      </Link>
    )
  }

  return {
    TYPE,
    helpers: {},
    changes: {},
    ui: createUi({TYPE}),
    plugins: [
      {
        schema: {
          rules: [
            link
          ]
        }
      }
    ]
  }
}
