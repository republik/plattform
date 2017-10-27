import React from 'react'
import { css } from 'glamor'

import MarkdownSerializer from '../../../../lib/serializer'
import { matchBlock, createBlockButton } from '../../utils'
import styles from '../../styles'
import Placeholder from '../../Placeholder'

import { getSerializationRules } from '../../utils/getRules'

export default ({rule, subModules, TYPE}) => {
  const {
    formatButtonText,
    placeholder
  } = rule.options || {}

  const inlineSerializer = new MarkdownSerializer({
    rules: getSerializationRules(
      subModules.reduce(
        (a, m) => a.concat(m.plugins),
        []
      )
    ).concat({
      matchMdast: (node) => node.type === 'break',
      fromMdast: (node, index, parent, visitChildren) => ({
        kind: 'text',
        leaves: [{text: '\n'}]
      })
    })
  })

  const Paragraph = rule.component

  const paragraph = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'paragraph',
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: inlineSerializer.fromMdast(node.children)
    }),
    toMdast: (object, index, parent, visitChildren) => ({
      type: 'paragraph',
      children: inlineSerializer.toMdast(object.nodes)
    }),
    render: ({children, attributes, node}) => (
      <Paragraph attributes={attributes} data={node.data.toJS()}>
        {children}
      </Paragraph>
    ),
    placeholder: placeholder && (({node}) => {
      if (node.text.length) return null

      return <Placeholder>{placeholder}</Placeholder>
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [
      paragraph
    ]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      blockFormatButtons: [
        formatButtonText && createBlockButton({
          type: TYPE
        })(
          ({ active, disabled, visible, ...props }) =>
            <span
              {...{...css(styles.blockButton), ...props}}
              data-active={active}
              data-disabled={disabled}
              data-visible={visible}
              >
              {formatButtonText}
            </span>
        )
      ]
    },
    plugins: [
      {
        onKeyDown (e, change) {
          const { state } = change
          if (e.key !== 'Enter') return
          if (e.shiftKey === false) return

          const { startBlock } = state
          const { type } = startBlock
          if (type !== TYPE) {
            return
          }

          return change.insertText('\n')
        },
        schema: {
          rules: [
            paragraph
          ]
        }
      }
    ]
  }
}
