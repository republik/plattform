import { fontStyles } from '@project-r/styleguide'
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import { css } from 'glamor'
import { matchBlock } from '../../utils'
import InlineUI from '../../utils/InlineUI'
import { matchAncestor } from '../../utils/matchers'
import createUi from './ui'

const COLORS = {
  IF: '#7fbf7b',
  ELSE: '#af8dc3',
  default: '#bbb',
}

const styles = {
  container: css({
    borderLeft: '2px solid',
    paddingLeft: 5,
    marginTop: 20,
    marginBottom: 20,
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

const VisibleCondition = ({ children, attributes, type, data }) => {
  const color = COLORS[type] || COLORS.default
  return (
    <div
      {...attributes}
      {...styles.container}
      style={{ borderLeftColor: color }}
    >
      <div
        {...styles.label}
        style={{ backgroundColor: color }}
        contentEditable={false}
      >
        {type} {data.get('present')}
      </div>
      {children}
    </div>
  )
}

export default ({ rule, subModules, TYPE, context }) => {
  const { editorOptions } = rule

  const serializerRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren, context }) => ({
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
        renderNode({ node, children, attributes, editor }) {
          if (!serializerRule.match(node)) return
          const isOuterCondition = editorOptions.type === 'IF'
          return (
            <div attributes={attributes}>
              {isOuterCondition && (
                <InlineUI
                  node={node}
                  editor={editor}
                  isMatch={matchAncestor(TYPE)}
                />
              )}
              <VisibleCondition type={editorOptions.type} data={node.data}>
                {children}
              </VisibleCondition>
            </div>
          )
        },
      },
    ],
  }
}
