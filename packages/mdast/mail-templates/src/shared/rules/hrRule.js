import HorizontalRule from '../components/HorizontalRule'
import { matchType } from '@republik/mdast-react-render'

const hrRule = {
  matchMdast: matchType('thematicBreak'),
  component: HorizontalRule,
}

export default hrRule
