import React from 'react'
import BlockQuote, { Paragraph } from '../components/BlockQuote'
import {
  matchParagraph,
  matchType,
  matchZone
} from 'mdast-react-render/lib/utils'
import legendRule from './legendRules'
import { inlineInteractionParagraphRules } from './paragraphRule'

const blockQuoteRule = {
  matchMdast: matchZone('BLOCKQUOTE'),
  component: BlockQuote,
  rules: [
    {
      matchMdast: matchType('blockquote'),
      component: ({ children }) => children,
      rules: [
        {
          matchMdast: matchParagraph,
          component: Paragraph,
          rules: inlineInteractionParagraphRules
        }
      ]
    },
    legendRule
  ]
}

export default blockQuoteRule
