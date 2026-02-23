import { fontStyles } from '@project-r/styleguide'
import MarkdownSerializer from '@republik/slate-mdast-serializer'
import { css } from 'glamor'
import { matchBlock } from '../../utils'
import InlineUI from '../../utils/InlineUI'
import { matchAncestor } from '../../utils/matchers'
import createUi from './ui'

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

const WebOnly = ({ children, attributes }) => {
  return (
    <div
      {...attributes}
      {...styles.container}
      style={{ borderLeftColor: '#A9A7E0' }}
    >
      <div
        {...styles.label}
        style={{ backgroundColor: '#A9A7E0' }}
        contentEditable={false}
      >
        Web-Only
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
        renderNode({ node, children, attributes, editor }) {
          if (!serializerRule.match(node)) return
          return (
            <div attributes={attributes}>
              <InlineUI
                node={node}
                editor={editor}
                isMatch={matchAncestor(TYPE)}
              />
              <WebOnly>{children}</WebOnly>
            </div>
          )
        },
        // this is a copy of the INFOBOX onKeDown handler. It's here to improve the
        // usability of the module, but could be removed if it causes unexpected issues.
        onKeyDown(event, change) {
          const isBackspace = event.key === 'Backspace'
          if (event.key !== 'Enter' && !isBackspace) return

          const { value } = change
          const inBox = value.document.getClosest(
            value.startBlock.key,
            matchBlock(TYPE),
          )
          if (!inBox) return

          const isEmpty = !inBox || !inBox.text

          // unwrap empty paragraph on enter
          const block = value.startBlock
          const isList = value.document.getClosest(
            block.key,
            matchBlock('LIST'),
          )

          if (!block.text && !isBackspace && !isList) {
            event.preventDefault()
            return change.unwrapBlock(TYPE).unwrapBlock('PARAGRAPH')
          }

          // rm info box if empty on backspace
          if (isBackspace && !isList) {
            event.preventDefault()
            const t = change.deleteBackward()
            if (isEmpty) {
              t.removeNodeByKey(inBox.key)
            }
            return t
          }
        },
      },
    ],
  }
}
