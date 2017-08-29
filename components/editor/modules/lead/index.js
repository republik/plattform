import React from 'react'
import { LeadButton } from './ui'
import { matchBlock } from '../../utils'
import { Lead } from '@project-r/styleguide'
import { LEAD } from './constants'

export const lead = {
  match: matchBlock(LEAD),
  matchMdast: (node) => node.type === 'blockquote',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: LEAD,
    nodes: visitChildren(node.children[0])
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'blockquote',
    children: [
      {
        type: 'paragraph',
        children: visitChildren(object)
      }
    ]
  }),
  render: ({ children }) => <Lead>{ children }</Lead>
}

export {
  LEAD,
  LeadButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          lead
        ]
      }
    }
  ]
}
