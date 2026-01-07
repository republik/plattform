import { fontStyles } from '@project-r/styleguide'
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import { css } from 'glamor'
import { matchBlock } from '../../utils'
import createUi from './ui'

const styles = {
  container: css({
    borderLeft: '2px solid',
    paddingLeft: 5,
    '& > p:nth-child(2)': {
      marginTop: 0,
    },
    '& > p + &': {
      marginTop: '-1.875rem',
    },
  }),
  label: css({
    marginLeft: -5,
    padding: '2px 0px 3px 5px',
    ...fontStyles.sansSerifMedium14,
  }),
}

const EmailOnly = ({ children, attributes }) => {
  return (
    <div
      {...attributes}
      {...styles.container}
      style={{ borderLeftColor: '#DAFF8D' }}
    >
      <div
        {...styles.label}
        style={{ backgroundColor: '#DAFF8D' }}
        contentEditable={false}
      >
        Email-Only
      </div>
      {children}
    </div>
  )
}

export default ({ rule, TYPE, context }) => {
  const { editorOptions } = rule

  const serializerRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren }) => ({
      kind: 'block',
      type: TYPE,
      data: node.data,
      nodes: visitChildren(node),
    }),
    toMdast: (object, index, parent, { visitChildren }) => ({
      type: 'zone',
      identifier: editorOptions.type,
      data: object.data,
      children: visitChildren(object),
    }),
  }

  const serializer = new MarkdownSerializer({
    rules: [serializerRule],
  })

  return {
    TYPE,
    helpers: {
      serializer,
    },
    changes: {},
    ui: createUi({ TYPE, editorOptions, context }),
    plugins: [
      {
        renderNode({ node, children, attributes }) {
          if (!serializerRule.match(node)) return
          return <EmailOnly attributes={attributes}>{children}</EmailOnly>
        },
      },
    ],
  }
}
