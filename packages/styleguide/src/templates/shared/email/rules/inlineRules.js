import React from 'react'
import { matchType } from '@republik/mdast-react-render/lib/utils'
import Sup from '../components/Sup'
import Sub from '../components/Sub'

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
]

export default inlineRules
