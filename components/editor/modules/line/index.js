import React from 'react'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'
import { Block } from 'slate'

import { matchBlock, buttonStyles } from '../../utils'
import injectBlock from '../../utils/injectBlock'

import MarkdownSerializer from 'slate-mdast-serializer'

const styles = {
  border: css({
    display: 'block',
    outline: `4px solid transparent`,
    width: '100%',
    lineHeight: 0,
    transition: 'outline-color 0.2s',
    marginTop: -30,
    '&[data-active="true"]': {
      outlineColor: colors.primary
    }
  })
}

export default ({ rule, subModules, TYPE }) => {
  const Component = rule.component

  const schemaRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: () => {
      return {
        kind: 'block',
        type: TYPE,
        isVoid: true,
        nodes: []
      }
    },
    toMdast: () => ({
      type: 'thematicBreak'
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [schemaRule]
  })

  const { insertButtonText, insertTypes = [] } = rule.editorOptions || {}

  const insertButtonClickHandler = (value, onChange) => event => {
    event.preventDefault()

    return onChange(
      value.change().call(injectBlock, Block.fromJSON(schemaRule.fromMdast()))
    )
  }
  const InsertButton =
    insertButtonText &&
    (({ value, onChange }) => {
      const disabled =
        value.isBlurred ||
        !value.blocks.every(n => insertTypes.includes(n.type))
      return (
        <span
          {...buttonStyles.insert}
          data-disabled={disabled}
          data-visible
          onMouseDown={insertButtonClickHandler(value, onChange)}
        >
          {insertButtonText}
        </span>
      )
    })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      insertButtons: [InsertButton]
    },
    plugins: [
      {
        renderNode(props) {
          const { node, editor, attributes } = props
          if (node.type !== TYPE) return
          const active = editor.value.blocks.some(
            block => block.key === node.key
          )
          return (
            <span {...styles.border} {...attributes} data-active={active}>
              <Component />
            </span>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              isVoid: true
            }
          }
        }
      }
    ]
  }
}
