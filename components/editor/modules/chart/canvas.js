import React from 'react'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'
import withT from '../../../../lib/withT'
import { focusPrevious } from '../../utils/keyHandlers'

import EditOverlay from './EditOverlay'

export default ({ rule, subModules, TYPE }) => {
  const CsvChart = withT(rule.component)

  const mdastRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent) => {
      return {
        kind: 'block',
        type: TYPE,
        data: {
          config: parent.data,
          values: node.value
        },
        isVoid: true,
        nodes: []
      }
    },
    toMdast: object => ({
      type: 'code',
      value: object.data.values
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [mdastRule]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    plugins: [
      {
        onKeyDown(event, change) {
          const isBackspace = event.key === 'Backspace'
          if (!isBackspace) return

          const inSelection = change.value.blocks.some(matchBlock(TYPE))
          if (inSelection) {
            return focusPrevious(change)
          }
        },
        renderNode(props) {
          const { node } = props
          if (node.type !== TYPE) return

          const config = node.data.get('config') || {}
          const values = node.data.get('values')

          const chart = (
            <CsvChart
              key={JSON.stringify({
                values,
                config
              })}
              showException
              values={values}
              config={config}
            />
          )

          return <EditOverlay {...props} preview={chart} />
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
