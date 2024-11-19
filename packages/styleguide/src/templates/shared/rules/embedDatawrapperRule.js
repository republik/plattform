import { matchZone } from '@republik/mdast-react-render'
import Datawrapper from '../../../components/Datawrapper'

export const embedDataWrapperRule = (resizable = true) => ({
  matchMdast: matchZone('EMBEDDATAWRAPPER'),
  component: Datawrapper,
  editorModule: 'embedDatawrapper',
  editorOptions: {
    type: 'EMBEDDATAWRAPPER',
    insertButtonText: 'Datawrapper (Beta)',
    insertTypes: ['PARAGRAPH'],
    resizable,
  },
  props: (node) => ({
    datawrapperId: node.data.datawrapperId,
    alt: node.data.alt,
    size: node.data.size,
    plain: node.data.plain,
  }),
  isVoid: true,
})
