import React from 'react'
import BlockQuote from '../components/BlockQuote'
import { interactionParagraphRule } from './paragraphRule'
import { matchType, matchZone } from 'mdast-react-render/lib/utils'
import legendRule from './legendRules'

const blockQuoteRule = {
  matchMdast: matchZone('BLOCKQUOTE'),
  component: BlockQuote,
  rules: [
    {
      matchMdast: matchType('blockquote'),
      component: ({ children }) => (
        <div style={{ backgroundColor: '#F6F8F7', padding: '25px' }}>
          {children}
        </div>
      ),
      rules: [interactionParagraphRule]
    },
    legendRule
  ]
}

export default blockQuoteRule
