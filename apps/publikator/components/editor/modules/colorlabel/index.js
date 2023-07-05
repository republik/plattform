import { matchInline } from '../../utils'
import MarkdownSerializer from '@republik/slate-mdast-serializer'

import createUi from './ui'

export default ({ rule, TYPE }) => {
  const ColorLabel = rule.component

  const colorLabel = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren }) => ({
      kind: 'inline',
      type: TYPE,
      data: node.data,
      nodes: visitChildren(node),
    }),
    toMdast: (object, index, parent, { visitChildren }) => ({
      type: 'span',
      data: {
        type: TYPE,
        ...object.data,
      },
      children: visitChildren(object),
    }),
  }

  const serializer = new MarkdownSerializer({
    rules: [colorLabel],
  })

  return {
    TYPE,
    helpers: {
      serializer,
    },
    changes: {},
    ui: createUi({ TYPE }),
    plugins: [
      {
        renderNode({ attributes, children, ...props }) {
          const { node } = props
          if (!colorLabel.match(node)) return
          return (
            <span {...attributes}>
              <ColorLabel {...node.data.toJS()}>{children}</ColorLabel>
            </span>
          )
        },
      },
    ],
  }
}
