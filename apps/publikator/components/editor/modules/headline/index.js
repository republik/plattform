import MarkdownSerializer from '@republik/slate-mdast-serializer'
import Placeholder from '../../Placeholder'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import {
  createStaticKeyHandler,
  createInsertAfterKeyHandler,
} from '../../utils/keyHandlers'
import { slug, mdastToString, mUp } from '@project-r/styleguide'
import { css } from 'glamor'

export default ({ rule, subModules, TYPE }) => {
  const {
    depth,
    placeholder,
    formatButtonText,
    formatTypes,
    isStatic = false,
  } = rule.editorOptions || {}

  const Headline = rule.component

  const inlineSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules,
          ),
        [],
      )
      .filter(Boolean),
  })

  const title = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'heading' && node.depth === depth,
    fromMdast: (node, index, parent, rest) => {
      return {
        kind: 'block',
        type: TYPE,
        nodes: inlineSerializer.fromMdast(node.children, 0, node, rest),
      }
    },
    toMdast: (object, index, parent, rest) => {
      return {
        type: 'heading',
        depth,
        children: inlineSerializer.toMdast(object.nodes, 0, object, rest),
      }
    },
  }

  const serializer = new MarkdownSerializer({
    rules: [title],
  })

  return {
    TYPE,
    helpers: {
      serializer,
    },
    changes: {},
    rule: title,
    ui: {
      blockFormatButtons: [
        formatButtonText &&
          createBlockButton({
            type: TYPE,
            parentTypes: formatTypes,
          })(({ active, disabled, visible, ...props }) => (
            <span
              {...buttonStyles.block}
              {...props}
              data-active={active}
              data-disabled={disabled}
              data-visible={visible}
            >
              {formatButtonText}
            </span>
          )),
      ],
    },
    plugins: [
      {
        onKeyDown: isStatic
          ? createStaticKeyHandler({ TYPE, rule })
          : createInsertAfterKeyHandler({ TYPE, rule }),
        renderPlaceholder:
          placeholder &&
          (({ node }) => {
            if (!title.match(node)) return
            if (node.text.length) return null

            return <Placeholder>{placeholder}</Placeholder>
          }),
        renderNode({ node, children, attributes }) {
          if (!title.match(node)) return

          return (
            <span {...attributes}>
              <Headline {...node.data.toJS()} slug={slug(node.text)}>
                {children}
              </Headline>
            </span>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [{ kinds: ['inline', 'text'] }],
            },
          },
        },
      },
    ],
  }
}

const styles = {
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
  anchor: css({
    display: 'block',
    visibility: 'hidden',
    position: 'relative',
    top: -65, // HEADER_HEIGHT_MOBILE + 20
    [mUp]: {
      top: -80, // HEADER_HEIGHT + 20
    },
  }),
}
