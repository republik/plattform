import { matchZone } from '@republik/mdast-react-render'
import { Else } from '../../styleguide-clone/components/Variables'

const elseRule = {
  matchMdast: matchZone('ELSE'),
  component: Else,
  editorModule: 'variableCondition',
  editorOptions: {
    type: 'ELSE',
  },
}

export default elseRule
