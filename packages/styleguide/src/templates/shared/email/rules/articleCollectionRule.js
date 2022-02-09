import { matchZone } from 'mdast-react-render/lib/utils'

const articleCollectionRule = {
  matchMdast: matchZone('ARTICLECOLLECTION'),
  component: () => null,
  isVoid: true,
}

export default articleCollectionRule
