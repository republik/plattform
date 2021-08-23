import { matchType } from 'mdast-react-render/lib/utils'
import HorizontalRule from '../components/HorizontalRule'

const hrRule = {
  matchMdast: matchType('hr'),
  component: HorizontalRule
}

export default hrRule
