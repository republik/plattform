import { matchInline } from '../../utils'
import MarkdownSerializer from '@republik/slate-mdast-serializer'
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
        // if there is a tile but no description, just 'title' is good
        // if there is no title but a description, we want '[SEPARATOR]description'
        title: [
          object.data.title || '',
          object.data.description?.replace(/[\r\n\v]+/g, ' '),
        ]
          .filter((x) => x !== undefined)
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
