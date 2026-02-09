import { matchZone } from '@republik/mdast-react-render'

const emailOnlyRule = {
  matchMdast: matchZone('EMAILONLY'),
  component: ({ children }) => <>{children}</>,
}

export default emailOnlyRule
