import { matchZone } from '@republik/mdast-react-render'
import { Author } from '../components/Author'

const authorRule = {
  matchMdast: matchZone('AUTHOR'),
  props: (node) => ({
    ...node.data,
  }),
  component: Author,
  editorModule: 'author',
  editorOptions: {
    insertButtonText: 'Autorin',
    insertTypes: ['PARAGRAPH'],
    type: 'AUTHOR',
  },
  isVoid: true,
}
export default authorRule
