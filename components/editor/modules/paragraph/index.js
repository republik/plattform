import React from 'react'
import { css } from 'glamor'
import { ParagraphButton } from './ui'
import { matchBlock } from '../../utils'
import { PARAGRAPH } from './constants'

export const styles = {
  paragraph: {
    margin: '0 auto 0.8em auto',
    maxWidth: 640
  }
}

export const isParagraph = matchBlock(PARAGRAPH)

export const paragraph = {
  match: isParagraph,
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
  render: ({ children }) => <p {...css(styles.paragraph)}>{ children }</p>
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
