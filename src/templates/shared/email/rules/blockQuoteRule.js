import BlockQuote from '../components/BlockQuote'
import { interactionParagraphRule } from './paragraphRule'
import { matchZone } from 'mdast-react-render/lib/utils'

const blockQuoteRule = {
  matchMdast: matchZone('blockquote'),
  component: BlockQuote,
  rules: [interactionParagraphRule]
}

export default blockQuoteRule
