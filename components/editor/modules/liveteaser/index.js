import { Block } from 'slate'
import MarkdownSerializer from 'slate-mdast-serializer'

import { matchBlock } from '../../utils'

import createUi from './ui'
import { TeaserInlineUI } from '../teaser/ui'
import {
  getIndex,
  getParent,
  insert,
  moveUp,
  moveDown
} from '../teaser/actions'

export default ({ rule, subModules, TYPE }) => {
  const zone = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node) => {
      return {
        kind: 'block',
        type: TYPE,
        data: {
          module: 'teasergroup',
          ...node.data
        },
        isVoid: true
      }
    },
    toMdast: (object) => {
      const { module, priorRepoIds, ...data } = object.data
      return {
        type: 'zone',
        identifier: 'LIVETEASER',
        data: data,
        children: []
      }
    }
  }

  const { editorOptions = {} } = rule

  const newBlock = () => Block.fromJSON(
    zone.fromMdast({
      type: 'zone',
      identifier: 'LIVETEASER',
      data: {
        id: editorOptions.insertId
      }
    })
  )

  const serializer = new MarkdownSerializer({
    rules: [
      zone
    ]
  })

  const Preview = rule.component
  const UI = TeaserInlineUI({})

  return {
    TYPE,
    helpers: {
      serializer,
      newBlock
    },
    changes: {},
    ui: createUi({ TYPE, newBlock, rule, zone }),
    plugins: [
      {
        renderNode ({ node, children, editor, attributes }) {
          if (!zone.match(node)) return

          const isSelected = editor.value.blocks.some(block => block.key === node.key) && !editor.value.isBlurred

          return <>
            <UI
              key='ui'
              isSelected={isSelected}
              nodeKey={node.key}
              getIndex={getIndex(editor)}
              getParent={getParent(editor)}
              moveUp={moveUp(editor)}
              moveDown={moveDown(editor)}
              insert={insert(editor)}
            />
            <Preview attributes={attributes} {...node.data.toJS()} />
          </>
        },
        onKeyDown: (event, change) => {
          const isBackspace = event.key === 'Backspace'
          const isDelete = event.key === 'Delete'
          if (!isBackspace && !isDelete) {
            return
          }

          const inSelection = change.value.blocks.some(zone.match)
          if (inSelection) {
            event.preventDefault()
            return true
          }
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
