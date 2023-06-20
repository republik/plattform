import { matchType } from '@republik/mdast-react-render'
import HorizontalRule from '../components/HorizontalRule'

const hrRule = {
  matchMdast: matchType('thematicBreak'),
  component: HorizontalRule,
}

export default hrRule
