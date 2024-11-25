import { matchZone } from '@republik/mdast-react-render'
import { Datawrapper, EdgeToEdgeDatawrapper } from '../components/Datawrapper'

const props = (node) => ({
  datawrapperId: node.data.datawrapperId,
  plain: node.data.plain,
})

const datawrapperRule = {
  matchMdast: matchZone('EMBEDDATAWRAPPER'),
  component: Datawrapper,
  props
}

export const edgeToEdgeDatawrapperRule = {
  matchMdast: matchZone('EMBEDDATAWRAPPER'),
  component: EdgeToEdgeDatawrapper,
  props
}

export default datawrapperRule
