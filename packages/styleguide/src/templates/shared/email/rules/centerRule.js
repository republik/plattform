import { matchZone } from '@republik/mdast-react-render'
import { editorialParagraphRule } from './paragraphRule'
import inlineHeadingsRules from './inlineHeadingsRule'
import blockQuoteRule from './blockQuoteRule'
import hrRule from './hrRule'
import Center from '../components/Center'
import { figureRule } from './figureRule'
import figureGroupRule from './figureGroupRule'
import noteRule from './noteRule'
import articleCollectionRule from './articleCollectionRule'
import listRule from './listRule'
import pullQuoteRule from './pullQuoteRule'
import infoBoxRule from './infoBoxRule'
import ifRule from './ifRule'
import elseRule from './elseRule'

const centerRule = {
  matchMdast: matchZone('CENTER'),
  component: Center,
  rules: [
    editorialParagraphRule,
    ...inlineHeadingsRules,
    hrRule,
    figureRule,
    figureGroupRule,
    listRule,
    blockQuoteRule,
    pullQuoteRule,
    noteRule,
    infoBoxRule,
    articleCollectionRule,
    ifRule,
    elseRule,
  ],
}

export default centerRule
