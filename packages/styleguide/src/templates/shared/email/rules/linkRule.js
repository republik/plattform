import { matchType } from 'mdast-react-render/lib/utils'
import { Link } from '../components/Link'

export const linkRule = {
  matchMdast: matchType('link'),
  component: Link,
  props: (node) => ({
    title: node.title,
    href: node.url,
  }),
}
