import React from 'react'
import { ParagraphButton } from './ui'
import { matchBlock } from '../../utils'
import { P } from '@project-r/styleguide'
import { PARAGRAPH } from './constants'

export const paragraph = {
  match: matchBlock(PARAGRAPH),
  matchMdast: (node) => node.type === 'paragraph',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: PARAGRAPH,
    nodes: visitChildren(node)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'paragraph',
    children: visitChildren(object)
  }),
  render: ({ children }) => <P>{ children }</P>
}

export {
  PARAGRAPH,
  ParagraphButton
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          paragraph
        ]
      }
    }
  ]
}
