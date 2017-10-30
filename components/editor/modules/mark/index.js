import React from 'react'

import { matchMark, createMarkButton, buttonStyles } from '../../utils'

import BoldIcon from 'react-icons/lib/fa/bold'
import ItalicIcon from 'react-icons/lib/fa/italic'
import StrikethroughIcon from 'react-icons/lib/fa/strikethrough'

const icons = {
  strong: BoldIcon,
  emphasis: ItalicIcon,
  delete: StrikethroughIcon
}

export default ({rule, subModules, TYPE}) => {
  const {
    type: mdastType
  } = rule.editorOptions
  if (!mdastType) {
    throw new Error(`Missing Mdast Type ${mdastType}`)
  }

  const Icon = icons[mdastType]
  if (!Icon) {
    throw new Error(`Unsupported Mdast Type ${mdastType}`)
  }

  const mark = {
    match: matchMark(TYPE),
    matchMdast: (node) => node.type === mdastType,
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'mark',
      type: TYPE,
      nodes: visitChildren(node)
    }),
    toMdast: (mark, index, parent, visitChildren) => ({
      type: mdastType,
      children: visitChildren(mark)
    }),
    render: rule.component
  }

  return {
    TYPE,
    helpers: {},
    changes: {},
    ui: {
      textFormatButtons: [
        createMarkButton({
          type: TYPE
        })(
          ({ active, disabled, visible, ...props }) =>
            <span
              {...buttonStyles.mark}
              {...props}
              data-active={active}
              data-disabled={disabled}
              data-visible={visible}
              >
              <Icon />
            </span>
        )
      ]
    },
    plugins: [
      {
        schema: {
          rules: [
            mark
          ]
        }
      }
    ]
  }
}
