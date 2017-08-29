import React from 'react'
import { LinkButton, LinkForm } from './ui'
import { matchInline } from '../../utils'
import { A } from '@project-r/styleguide'
import { LINK } from './constants'

export const link = {
  match: matchInline(LINK),
  matchMdast: (node) => node.type === 'link',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'inline',
    type: LINK,
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
  render: ({ children, node }) => (
    <A
      href={node.getIn(['data', 'href'])}
    >{ children }</A>
  )
}

export {
  LINK,
  LinkForm,
  LinkButton
}

export default {
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
