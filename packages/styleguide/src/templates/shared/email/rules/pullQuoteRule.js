import { matchParagraph, matchZone } from '@republik/mdast-react-render'
import { matchFigure, matchLast } from '../../../Article/utils'
import inlineRules from './inlineRules'
import { linkRule } from './linkRule'
import { getImageRules } from './figureRule'
import {
  PullQuote,
  PullQuoteSource,
  PullQuoteText,
} from '../components/PullQuote'
import { Figure } from '../components/Figure'

const pullQuoteRule = {
  matchMdast: matchZone('QUOTE'),
  component: PullQuote,
  props: (node) => ({
    hasFigure: !!node.children.find(matchZone('FIGURE')),
  }),
  rules: [
    {
      matchMdast: matchZone('FIGURE'),
      component: Figure,
      rules: getImageRules({ forceWidth: '155px' }),
    },
    {
      // PullQuote text
      matchMdast: (node, index, parent) =>
        matchParagraph(node) &&
        (index === 0 ||
          (index === 1 && matchFigure(parent.children[0])) ||
          !matchLast(node, index, parent)),
      component: PullQuoteText,
      rules: [...inlineRules, linkRule],
    },
    {
      // PullQuote Source
      matchMdast: (node, index, parent) =>
        matchParagraph(node) && matchLast(node, index, parent),
      component: PullQuoteSource,
      rules: [...inlineRules, linkRule],
    },
  ],
}

export default pullQuoteRule
