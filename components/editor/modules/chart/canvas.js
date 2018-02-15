import React from 'react'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'
import withT from '../../../../lib/withT'
import { focusPrevious } from '../../utils/keyHandlers'

import { EditButton, EditModal } from './ui'

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
          const { editor, node, attributes } = props
          if (node.type !== TYPE) return

          const config = node.data.get('config') || {}
          const values = node.data.get('values')

          const startEditing = () => {
            editor.change(change => {
              change.setNodeByKey(node.key, {
                data: node.data.set('isEditing', true)
              })
            })
          }
          return (
            <div {...attributes} onDoubleClick={startEditing}>
              <EditButton onClick={startEditing} />
              {!!node.data.get('isEditing') && (
                <EditModal data={node.data}
                  onChange={(data) => {
                    editor.change(change => {
                      change.setNodeByKey(node.key, {
                        data
                      })
                    })
                  }}
                  onClose={() => {
                    editor.change(change => {
                      change.setNodeByKey(node.key, {
                        data: node.data.delete('isEditing')
                      })
                    })
                  }} />
              )}
              <CsvChart
                key={JSON.stringify({
                  values,
                  config
                })}
                showException
                values={values}
                config={config} />
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
