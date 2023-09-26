import { matchZone } from '@republik/mdast-react-render'
import { If } from '../../../../components/Variables'

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
  isVoid: true,
}

export default ifRule
