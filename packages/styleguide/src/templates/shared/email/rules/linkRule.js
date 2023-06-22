import { matchType } from '@republik/mdast-react-render'
import { Link } from '../components/Link'

export const linkRule = {
  matchMdast: matchType('link'),
  component: Link,
  props: (node) => ({
    title: node.title,
    href: node.url,
  }),
}
