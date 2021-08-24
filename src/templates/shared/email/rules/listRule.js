import { matchType } from 'mdast-react-render/lib/utils'
import List, { ListItem } from '../components/List'
import { editorialParagraphRule } from './paragraphRule'

const listRule = {
  matchMdast: matchType('list'),
  component: List,
  props: node => {
    return {
      ordered: node.ordered,
      start: node.start
    }
  },
  rules: [
    {
      matchMdast: matchType('listItem'),
      component: ListItem,
      rules: [editorialParagraphRule]
    }
  ]
}

export default listRule
