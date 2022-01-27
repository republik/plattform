import React from 'react'
import { colors } from '@project-r/styleguide'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

import createUi from './ui'

export default ({ rule, subModules, TYPE }) => {
  const zone = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: node => {
      return {
        kind: 'block',
        type: TYPE,
        data: {
          identifier: node.identifier,
          ...node.data
        },
        isVoid: true
      }
    },
    toMdast: object => {
      const { identifier, ...data } = object.data
      return {
        type: 'zone',
        identifier,
        data: data,
        children: []
      }
    }
  }

  const newBlock = () =>
    Block.fromJSON(
      zone.fromMdast({
        type: 'zone',
        identifier: 'SPECIAL',
        data: {}
      })
    )

  const serializer = new MarkdownSerializer({
    rules: [zone]
  })

  return {
    TYPE,
    helpers: {
      serializer,
      newBlock
    },
    changes: {},
    ui: createUi({ TYPE, newBlock, rule }),
    plugins: [
      {
        renderNode({ node, children, editor: { value }, attributes }) {
          if (!zone.match(node)) return

          const active = value.blocks.some(block => block.key === node.key)
          return (
            <div
              style={{
                width: '100%',
                height: '20vh',
                paddingTop: '8vh',
                textAlign: 'center',
                backgroundColor: colors.primaryBg,
                transition: 'outline-color 0.2s',
                outline: '4px solid transparent',
                outlineColor: active ? colors.primary : 'transparent',
                marginBottom: 10
              }}
              {...attributes}
            >
              {node.data.get('identifier') || 'Special'}
            </div>
          )
        },
        schema: {
          [TYPE]: {
            isVoid: true
          }
        }
      }
    ]
  }
}
