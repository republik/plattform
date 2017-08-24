import React from 'react'
import { TitleButton } from './ui'
import { matchBlock } from '../../utils'
import { H1 } from '@project-r/styleguide'
import { TITLE } from './constants'

export const title = {
  match: matchBlock(TITLE),
  matchMdast: (node) => node.type === 'heading' && node.depth === 1,
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: TITLE,
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'heading',
    depth: 1,
    children: visitChildren(object)
  }),
  render: ({ children }) => <H1>{ children }</H1>
}

export {
  TITLE,
  TitleButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          title
        ]
      }
    }
  ]
}
