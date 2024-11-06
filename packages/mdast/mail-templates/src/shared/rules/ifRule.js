import { If } from '../../styleguide-clone/components/Variables'
import { matchZone } from '@republik/mdast-react-render'

const ifRule = {
  matchMdast: matchZone('IF'),
  component: If,
  props: (node) => ({
    present: node.data.present,
  }),
  editorModule: 'variableCondition',
  editorOptions: {
    type: 'IF',
    insertBlocks: ['greeting', 'hasAccess'],
    insertTypes: ['PARAGRAPH'],
    fields: [
      {
        key: 'present',
        items: [
          { value: 'firstName', text: 'Vorname' },
          { value: 'lastName', text: 'Nachname' },
          { value: 'hasAccess', text: 'Magazin-Zugriff' },
        ],
      },
    ],
  },
}

export default ifRule
