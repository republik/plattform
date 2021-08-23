import { matchZone } from 'mdast-react-render/lib/utils'
import { editorialParagraphRule } from './paragraphRule'
import inlineHeadingsRules from './inlineHeadingsRule'
import blockQuoteRule from './blockQuoteRule'
import hrRule from './hrRule'
import Center from '../components/Center'

const centerRule = {
  matchMdast: matchZone('CENTER'),
  component: Center,
  rules: [
    editorialParagraphRule,
    ...inlineHeadingsRules,
    hrRule,
    blockQuoteRule
  ]
}

export default centerRule
