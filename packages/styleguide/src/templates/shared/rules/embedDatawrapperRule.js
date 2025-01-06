import { matchZone } from '@republik/mdast-react-render'
import Datawrapper from '../../../components/Datawrapper'

// email first embeds are:
//  1. not resizable
//  2. plain by default (no header/footer)
export const embedDataWrapperRule = ({ emailFirst } = {}) => ({
  matchMdast: matchZone('EMBEDDATAWRAPPER'),
  component: Datawrapper,
  editorModule: 'embedDatawrapper',
  editorOptions: {
    type: 'EMBEDDATAWRAPPER',
    insertButtonText: 'Datawrapper (Beta)',
    insertTypes: ['PARAGRAPH'],
    emailFirst,
  },
  props: (node) => ({
    datawrapperId: node.data.datawrapperId,
    alt: node.data.alt,
    size: node.data.size,
    plain: node.data.plain,
  }),
  isVoid: true,
})
