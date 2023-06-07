import { matchZone } from '@republik/mdast-react-render'

const teaserGroupRule = {
  matchMdast: matchZone('TEASERGROUP'),
  component: () => null,
  isVoid: true,
}

export default teaserGroupRule
