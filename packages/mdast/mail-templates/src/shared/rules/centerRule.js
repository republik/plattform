import { matchZone } from '@republik/mdast-react-render'
import Center from '../components/Center'
import articleCollectionRule from './articleCollectionRule'
import authorRule from './authorRule'
import blockQuoteRule from './blockQuoteRule'
import buttonRule from './buttonRule'
import datawrapperRule from './datawrapperRule'
import elseRule from './elseRule'
import emailOnlyRule from './emailOnlyRule'
import figureGroupRule from './figureGroupRule'
import { figureRule } from './figureRule'
import hrRule from './hrRule'
import ifRule from './ifRule'
import infoBoxRule from './infoBoxRule'
import inlineHeadingsRules from './inlineHeadingsRule'
import listRule from './listRule'
import noteRule from './noteRule'
import { editorialParagraphRule } from './paragraphRule'
import pullQuoteRule from './pullQuoteRule'
import webOnlyRule from './webOnlyRule'

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
    authorRule,
    buttonRule,
    datawrapperRule,
    webOnlyRule,
    emailOnlyRule,
  ],
}

export default centerRule
