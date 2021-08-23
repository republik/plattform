import { matchZone } from 'mdast-react-render/lib/utils'

const articleCollectionRule = {
  matchMdast: matchZone('ARTICLECOLLECTION'),
  component: () => null
}

export default articleCollectionRule
