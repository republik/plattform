import { matchZone } from '@republik/mdast-react-render'

const webOnlyRule = {
  matchMdast: matchZone('WEBONLY'),
  component: () => null,
}

export default webOnlyRule
