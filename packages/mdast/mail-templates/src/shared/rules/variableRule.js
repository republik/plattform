import { Variable } from '../../styleguide-clone/components/Variables'
import { matchSpan } from '../util/matchers'

const variableRule = {
  matchMdast: (node) => matchSpan(node) && node.data?.variable,
  props: (node) => node.data,
  component: Variable,
  editorModule: 'variable',
  editorOptions: {
    insertVar: true,
    insertTypes: ['PARAGRAPH'],
    fields: [
      {
        key: 'variable',
        items: [
          { value: 'firstName', text: 'Vorname' },
          { value: 'lastName', text: 'Nachname' },
        ],
      },
      {
        key: 'fallback',
      },
    ],
  },
}

export default variableRule
