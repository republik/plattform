import React from 'react'
import { matchType } from '@republik/mdast-react-render'
import Sup from '../components/Sup'
import Sub from '../components/Sub'
import variableRule from './variableRule'

const inlineRules = [
  {
    matchMdast: matchType('sup'),
    component: Sup,
  },
  {
    matchMdast: matchType('sub'),
    component: Sub,
  },
  {
    matchMdast: matchType('break'),
    component: () => <br />,
    isVoid: true,
  },
  variableRule,
]

export default inlineRules
