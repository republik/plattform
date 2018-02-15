import React from 'react'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'
import withT from '../../../../lib/withT'
import { focusPrevious } from '../../utils/keyHandlers'

export default ({rule, subModules, TYPE}) => {
  const CsvChart = withT(rule.component)

  const mdastRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent) => {
      return ({
        kind: 'block',
        type: TYPE,
        data: {
          config: parent.data,
          values: node.value
        },
        isVoid: true,
        nodes: []
      })
    },
    toMdast: (object) => ({
      type: 'code',
      value: object.data.values
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [
      mdastRule
    ]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    plugins: [
      {
        onKeyDown (event, change) {
          const isBackspace = event.key === 'Backspace'
          if (!isBackspace) return

          const inSelection = change.value.blocks.some(matchBlock(TYPE))
          if (inSelection) {
            return focusPrevious(change)
          }
        },
        renderNode (props) {
          const { node, attributes } = props
          if (node.type !== TYPE) return

          const config = node.data.get('config') || {}
          const values = node.data.get('values')

          return (
            <div {...attributes}>
              {config.type && values && <CsvChart
                values={values}
                config={config} />}
            </div>
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
