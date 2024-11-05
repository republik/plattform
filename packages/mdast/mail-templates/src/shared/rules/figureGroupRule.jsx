import { matchZone } from '@republik/mdast-react-render'
import { figureRule } from './figureRule'
import legendRule from './legendRules'

const figureGroupRule = {
  matchMdast: matchZone('FIGUREGROUP'),
  component: ({ children }) => <div role='group'>{children}</div>,
  rules: [figureRule, legendRule],
}

export default figureGroupRule
