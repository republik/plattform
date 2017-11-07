import React from 'react'
import { matchBlock } from '../../utils'
import { findOrCreate } from '../../utils/serialization'
import MarkdownSerializer from 'slate-mdast-serializer'

import embedFromUrlPlugin from './embedFromUrlPlugin'

const fromMdast = ({ TYPE }) =>
  (node, index, parent, visitChildren) => {
    const deepNodes = node.children.reduce(
      (children, child) => children
        .concat(child)
        .concat(child.children),
      []
    )
    const link = findOrCreate(deepNodes, {type: 'link'})

    return {
      kind: 'block',
      type: TYPE,
      isVoid: true,
      data: {
        ...node.data,
        originalUrl: link.url
      }
    }
  }

const toMdast = ({ TYPE }) =>
  (node, index, parent, visitChildren) => {
    const {originalUrl, ...data} = node.data
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
              title: originalUrl,
              url: originalUrl,
              children: [
                {
                  type: 'text',
                  value: originalUrl
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
        matchMdast: options.rule.matchMdast,
        fromMdast: fromMdast(options),
        toMdast: toMdast(options)
      }
    ]
  })

const embedPlugin = options =>
  ({
    renderNode ({node, children, attributes}) {
      const Embed = options.rule.component
      if (!matchBlock(options.TYPE)(node)) return
      return (
        <Embed data={node.data.toJS()} />
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
        match: matchBlock(rule.editorOptions.lookupType),
        TYPE
      })
    ]
  }
}
