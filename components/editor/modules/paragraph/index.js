import React from 'react'
import { css } from 'glamor'
import { ParagraphButton } from './ui'
import { matchBlock } from '../../utils'
import { PARAGRAPH } from './constants'
import MarkdownSerializer from '../../../../lib/serializer'
import {getSerializationRules} from '../../utils/getRules'

import marks from '../marks'
import link from '../link'

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

export const serializer = new MarkdownSerializer({
  rules: [
    paragraph
  ].concat(getSerializationRules([
    ...marks.plugins,
    ...link.plugins
  ]))
})

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
