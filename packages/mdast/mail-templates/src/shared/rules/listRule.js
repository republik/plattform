import { matchParagraph, matchType } from '@republik/mdast-react-render'
import List, { ListItem, ListParagraph } from '../components/List'
import { inlineEditorialParagraphRules } from './paragraphRule'

const listRule = {
  matchMdast: matchType('list'),
  component: List,
  props: (node) => {
    return {
      ordered: node.ordered,
      start: node.start,
    }
  },
  rules: [
    {
      matchMdast: matchType('listItem'),
      component: ListItem,
      rules: [
        {
          matchMdast: matchParagraph,
          // Custom paragraph required as the margin defers from the default variant
          component: ListParagraph,
          rules: inlineEditorialParagraphRules,
        },
      ],
    },
  ],
}

export default listRule
