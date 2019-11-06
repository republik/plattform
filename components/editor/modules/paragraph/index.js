import React from 'react'

import MarkdownSerializer from 'slate-mdast-serializer'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import {
  createSoftBreakKeyHandler,
  createStaticKeyHandler
} from '../../utils/keyHandlers'
import Placeholder from '../../Placeholder'

const removeMarksFromSpace = node => {
  return !node.leaves
    ? node
    : {
        ...node,
        leaves: node.leaves.map(leaf => {
          return leaf.text &&
            leaf.text.trim() === '' &&
            leaf.marks &&
            leaf.marks.length
            ? { ...leaf, marks: [] }
            : leaf
        })
      }
}

export default ({ rule, subModules, TYPE }) => {
  const { formatButtonText, placeholder, mdastPlaceholder, isStatic = false } =
    rule.editorOptions || {}

  const inlineSerializer = new MarkdownSerializer({
    rules: subModules
      .reduce(
        (a, m) =>
          a.concat(
            m.helpers && m.helpers.serializer && m.helpers.serializer.rules
          ),
        []
      )
      .filter(Boolean)
      .concat({
        matchMdast: node => node.type === 'break',
        fromMdast: () => ({
          kind: 'text',
          leaves: [{ kind: 'leaf', text: '\n', marks: [] }]
        })
      })
  })

  const Paragraph = rule.component

  const paragraph = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast || (node => node.type === 'paragraph'),
    fromMdast: (node, index, parent, rest) => {
      let children = node.children
      if (mdastPlaceholder) {
        if (
          children &&
          children.length === 1 &&
          children[0].type === 'text' &&
          children[0].value === mdastPlaceholder
        ) {
          children = [{ type: 'text', value: '' }]
        }
      }

      return {
        kind: 'block',
        type: TYPE,
        nodes: inlineSerializer.fromMdast(children, 0, node, rest)
      }
    },
    toMdast: (object, index, parent, rest) => {
      let children = inlineSerializer.toMdast(
        object.nodes.map(removeMarksFromSpace),
        0,
        object,
        rest
      )

      if (mdastPlaceholder) {
        if (
          !children ||
          !children.length ||
          (children.length === 1 &&
            children[0].type === 'text' &&
            !(children[0].value || '').trim())
        ) {
          children = [{ type: 'text', value: mdastPlaceholder }]
        }
      }

      return {
        type: 'paragraph',
        children: children
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [paragraph]
  })

  const paragraphSoftBreakHandler = createSoftBreakKeyHandler({ TYPE })
  const paragraphStaticHandler = createStaticKeyHandler({
    TYPE,
    rule: rule || {}
  })

  return {
    TYPE,
    rule,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      blockFormatButtons: [
        formatButtonText &&
          createBlockButton({
            type: TYPE
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
          ))
      ]
    },
    plugins: [
      {
        onKeyDown: (...args) => {
          const softBreak = paragraphSoftBreakHandler(...args)
          if (softBreak) {
            return softBreak
          }
          if (isStatic) {
            return paragraphStaticHandler(...args)
          }
        },
        renderPlaceholder:
          placeholder &&
          (({ node }) => {
            if (!paragraph.match(node)) return
            if (node.text.length) return null

            return <Placeholder>{placeholder}</Placeholder>
          }),
        renderNode({ node, children, attributes }) {
          if (!paragraph.match(node)) return

          // #TODO: Either data attribute or spread
          return (
            <Paragraph
              attributes={{ ...attributes, style: { position: 'relative' } }}
              data={node.data.toJS()}
              {...node.data.toJS()}
            >
              <span style={{ position: 'relative', display: 'block' }}>
                {children}
              </span>
            </Paragraph>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  kinds: ['text', 'inline']
                }
              ],
              normalize: (change, reason, { node, index, child }) => {
                if (reason === 'child_kind_invalid') {
                  change.unwrapBlockByKey(child.key)
                }
              }
            }
          }
        }
      }
    ]
  }
}
