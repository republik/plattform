import { matchZone } from '@republik/mdast-react-render'

const articleCollectionRule = {
  matchMdast: matchZone('ARTICLECOLLECTION'),
  component: () => null,
  isVoid: true,
}

export default articleCollectionRule
