import { matchZone } from 'mdast-react-render/lib/utils'
import { editorialParagraphRule } from './paragraphRule'
import inlineHeadingsRules from './inlineHeadingsRule'
import blockQuoteRule from './blockQuoteRule'
import hrRule from './hrRule'
import Center from '../components/Center'
import { figureRule } from './figureRule'
import noteRule from './noteRule'
import articleCollectionRule from './articleCollectionRule'

const centerRule = {
  matchMdast: matchZone('CENTER'),
  component: Center,
  rules: [
    editorialParagraphRule,
    ...inlineHeadingsRules,
    hrRule,
    figureRule,
    blockQuoteRule,
    noteRule,
    articleCollectionRule
  ]
}

export default centerRule
