import { matchInline } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'
import { EXPANDABLE_LINK_SEPARATOR as SEPARATOR } from '@project-r/styleguide'

import createUi from './ui'

export default ({ rule, subModules, TYPE }) => {
  const Link = rule.component
  const { formatTypes } = rule.editorOptions || {}

  const link = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren, context }) => {
      const [title, description] = (node.title || '').split(SEPARATOR)
      return {
        kind: 'inline',
        type: TYPE,
        data: {
          title,
          href: node.url,
          description,
          color: context.color,
        },
        nodes: visitChildren(node),
      }
    },
    toMdast: (object, index, parent, { visitChildren }) => {
      return {
        type: 'link',
        title: [object.data.title, object.data.description]
          .filter(Boolean)
          .join(SEPARATOR),
        url: object.data.href,
        children: visitChildren(object),
      }
    },
  }

  const serializer = new MarkdownSerializer({
    rules: [link],
  })

  return {
    TYPE,
    helpers: {
      serializer,
    },
    changes: {},
    ui: createUi({ TYPE, parentTypes: formatTypes }),
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!link.match(node)) return
          return (
            <Link {...node.data.toJS()} attributes={attributes}>
              {children}
            </Link>
          )
        },
      },
    ],
  }
}
