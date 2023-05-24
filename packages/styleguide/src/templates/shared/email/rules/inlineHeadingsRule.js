import { matchHeading } from '@republik/mdast-react-render/lib/utils'
import { Heading2 } from '../components/Heading'
import inlineRules from './inlineRules'

const inlineHeadingsRules = [
  {
    matchMdast: matchHeading(2),
    component: Heading2,
    rules: inlineRules,
  },
]

export default inlineHeadingsRules
