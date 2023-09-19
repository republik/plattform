import { css } from 'glamor'
import { colors, EmailAuthor } from '@project-r/styleguide'
import { Block } from 'slate'

import { matchBlock } from '../../utils'

import MarkdownSerializer from '@republik/slate-mdast-serializer'
import createUi from './ui'

const styles = {
  border: css({
    display: 'block',
    outline: `4px solid transparent`,
    width: '100%',
    lineHeight: 0,
    transition: 'outline-color 0.2s',
    marginTop: -30,
    '&[data-active="true"]': {
      outlineColor: colors.primary,
    },
  }),
}

export default ({ rule, subModules, TYPE }) => {
  const Component = EmailAuthor

  const schemaRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node = {}) => {
      return {
        kind: 'block',
        type: TYPE,
        isVoid: true,
        data: node.data,
        nodes: [],
      }
    },
    toMdast: (object = {}) => ({
      type: 'zone',
      identifier: TYPE,
      children: [],
      data: object.data,
    }),
  }

  const serializer = new MarkdownSerializer({
    rules: [schemaRule],
  })

  const newBlock = Block.fromJSON(schemaRule.fromMdast())

  return {
    TYPE,
    helpers: {
      serializer,
    },
    changes: {},
    ui: createUi({
      TYPE,
      newBlock,
      editorOptions: rule.editorOptions,
    }),
    plugins: [
      {
        renderNode(props) {
          const { node, editor, attributes } = props
          if (node.type !== TYPE) return
          const active = editor.value.blocks.some(
            (block) => block.key === node.key,
          )
          return (
            <span {...styles.border} {...attributes} data-active={active}>
              <Component {...node.data.toJS()} />
            </span>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              isVoid: true,
            },
          },
        },
      },
    ],
  }
}
