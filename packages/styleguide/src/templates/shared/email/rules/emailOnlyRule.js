import { matchZone } from '@republik/mdast-react-render'

const emailOnlyRule = {
  matchMdast: matchZone('EMAILONLY'),
  component: () => null,
  editorModule: 'emailOnly',
  editorOptions: {
    insertTypes: ['PARAGRAPH'],
    type: 'EMAILONLY',
  },
}

export default emailOnlyRule
