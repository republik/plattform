import { matchZone } from '@republik/mdast-react-render/lib/utils'

const teaserGroupRule = {
  matchMdast: matchZone('TEASERGROUP'),
  component: () => null,
  isVoid: true,
}

export default teaserGroupRule
