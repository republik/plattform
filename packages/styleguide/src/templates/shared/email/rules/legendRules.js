import {
  matchParagraph,
  matchType,
} from '@republik/mdast-react-render/lib/utils'
import { Byline, Caption } from '../components/Caption'
import { linkRule } from './linkRule'
import inlineRules from './inlineRules'

const legendRule = {
  matchMdast: matchParagraph,
  component: Caption,
  rules: [
    {
      matchMdast: matchType('emphasis'),
      component: Byline,
    },
    linkRule,
    inlineRules,
  ],
}

export default legendRule
