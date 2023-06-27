import React from 'react'
import BlockQuote, {
  Paragraph,
  ParagraphWrapper,
} from '../components/BlockQuote'
import {
  matchParagraph,
  matchType,
  matchZone,
} from '@republik/mdast-react-render'
import legendRule from './legendRules'
import { inlineInteractionParagraphRules } from './paragraphRule'

const blockQuoteRule = {
  matchMdast: matchZone('BLOCKQUOTE'),
  props: (node) => {
    return {
      isEmpty:
        node.children &&
        node.children.length === 1 &&
        !node.children[0].children,
    }
  },
  component: ({ children, isEmpty }) => {
    if (isEmpty) return null
    return <BlockQuote>{children}</BlockQuote>
  },
  rules: [
    {
      matchMdast: matchType('blockquote'),
      component: ParagraphWrapper,
      rules: [
        {
          matchMdast: matchParagraph,
          component: Paragraph,
          rules: inlineInteractionParagraphRules,
        },
      ],
    },
    legendRule,
  ],
}

export default blockQuoteRule
