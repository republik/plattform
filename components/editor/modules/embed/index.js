import React from 'react'
import { matchBlock } from '../../utils'
import { findOrCreate } from '../../utils/serialization'
import MarkdownSerializer from 'slate-mdast-serializer'
import { colors } from '@project-r/styleguide'
import { css } from 'glamor'

import embedFromUrlPlugin from './embedFromUrlPlugin'

const styles = {
  border: css({
    display: 'inline-block',
    outline: `4px solid transparent`,
    width: '100%',
    lineHeight: 0,
    transition: 'outline-color 0.2s',
    '&[data-active="true"]': {
      outlineColor: colors.primary
    },
    pointerEvents: 'none'
  })
}

const fromMdast = ({ TYPE }) => (
  node,
  index,
  parent,
  visitChildren
) => {
  const deepNodes = node.children.reduce(
    (children, child) =>
      children
        .concat(child)
        .concat(child.children),
    []
  )
  const link = findOrCreate(deepNodes, {
    type: 'link'
  })

  return {
    kind: 'block',
    type: TYPE,
    isVoid: true,
    data: {
      ...node.data,
      url: link.url
    }
  }
}

const toMdast = ({ TYPE }) => (
  node,
  index,
  parent,
  visitChildren
) => {
  const {
    url,
    ...data
  } = node.data
  return {
    type: 'zone',
    identifier: TYPE,
    data,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            title: url,
            url,
            children: [
              {
                type: 'text',
                value: url
              }
            ]
          }
        ]
      }
    ]
  }
}

const getSerializer = options =>
  new MarkdownSerializer({
    rules: [
      {
        match: matchBlock(options.TYPE),
        matchMdast:
          options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })

const embedPlugin = options => ({
  renderNode ({
    node,
    children,
    editor
  }) {
    const Embed = options.rule.component
    if (!matchBlock(options.TYPE)(node)) {
      return
    }

    const active = editor.value.blocks.some(
      block => block.key === node.key
    )
    return (
      <span
        {...styles.border}
        data-active={active}
        contentEditable={false}
      >
        <Embed
          data={node.data.toJS()}
        />
      </span>
    )
  },
  schema: {
    blocks: {
      [options.TYPE]: {
        isVoid: true
      }
    }
  }
})

export default options => {
  const { rule, TYPE } = options

  return {
    helpers: {
      serializer: getSerializer(options)
    },
    changes: {},
    plugins: [
      embedPlugin(options),
      embedFromUrlPlugin({
        match: matchBlock(
          rule.editorOptions.lookupType.toUpperCase()
        ),
        TYPE
      })
    ]
  }
}
