import { matchType } from 'mdast-react-render/lib/utils'
import { Br } from '../../../EditorialNewsletter/email/Paragraph'
import Sup from '../components/Sup'
import Sub from '../components/Sub'

const inlineRules = [
  {
    matchMdast: matchType('sup'),
    component: Sup
  },
  {
    matchMdast: matchType('sub'),
    component: Sub
  },
  {
    matchMdast: matchType('break'),
    component: Br,
    isVoid: true
  }
]

export default inlineRules
