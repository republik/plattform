import React from 'react'
import { css } from 'glamor'
import { ParagraphButton } from './ui'
import { matchBlock } from '../../utils'
import { PARAGRAPH } from './constants'
import MarkdownSerializer from '../../../../lib/serializer'
import { getSerializationRules } from '../../utils/getRules'

import marks from '../marks'

const styles = {
  paragraph: {
    margin: '0 0 0.8em'
  }
}

const isParagraph = matchBlock(PARAGRAPH)

const inlineSerializer = new MarkdownSerializer({
  rules: getSerializationRules([
    ...marks.plugins
  ]).concat({
    matchMdast: (node) => node.type === 'break',
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'text',
      leaves: [{text: '\n'}]
    })
  })
})

const paragraph = {
  match: isParagraph,
  matchMdast: (node) => node.type === 'paragraph',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: PARAGRAPH,
    nodes: inlineSerializer.fromMdast(node.children)
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'paragraph',
    children: inlineSerializer.toMdast(object.nodes)
  }),
  render: ({ children, attributes }) => <p {...css(styles.paragraph)} {...attributes}>{ children }</p>
}

export const serializer = new MarkdownSerializer({
  rules: [
    paragraph
  ]
})

export {
  PARAGRAPH,
  ParagraphButton
}

export default {
  plugins: [
    {
      onKeyDown (e, change) {
        const { state } = change
        if (e.key !== 'Enter') return
        if (e.shiftKey === false) return

        const { startBlock } = state
        const { type } = startBlock
        if (type !== PARAGRAPH) {
          return
        }

        return change.insertText('\n')
      },
      schema: {
        rules: [
          paragraph
        ]
      }
    }
  ]
}
