import { matchZone } from '@republik/mdast-react-render'
import { Datawrapper, EdgeToEdgeDatawrapper } from '../components/Datawrapper'

const props = (node) => ({
  datawrapperId: node.data.datawrapperId,
  alt: node.data.alt,
  plain: node.data.plain,
})

export const datawrapperRule = {
  matchMdast: matchZone('EMBEDDATAWRAPPER'),
  component: Datawrapper,
  props
}

export const edgeToEdgeDatawrapperRule = {
  matchMdast: matchZone('EMBEDDATAWRAPPER'),
  component: EdgeToEdgeDatawrapper,
  props
}
