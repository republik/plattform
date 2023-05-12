import React from 'react'
import { matchZone } from 'mdast-react-render/lib/utils'
import { figureRule } from './figureRule'
import legendRule from './legendRules'

const figureGroupRule = {
  matchMdast: matchZone('FIGUREGROUP'),
  component: ({ children }) => <div role='group'>{children}</div>,
  rules: [figureRule, legendRule],
}

export default figureGroupRule
