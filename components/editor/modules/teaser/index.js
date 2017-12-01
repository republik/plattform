import React from 'react'
import { matchBlock } from '../../utils'
import { Block } from 'slate'
import { gray2x1 } from '../../utils/placeholder'

import { getSerializer, getSubmodules } from './serializer'

import {
  getIndex,
  getParentKey,
  insert,
  move
} from './dnd'

import { TeaserButton, TeaserInlineUI, TeaserForm } from './ui'

export const getData = data => ({
  textPosition: 'topleft',
  color: '#fff',
  bgColor: '#000',
  linkColor: '#f00',
  center: false,
  image: gray2x1,
  kind: 'editorial',
  titleSize: 'standard',
  teaserType: 'frontImage',
  reverse: false,
  portrait: true,
  ...data || {}
})

export const getNewItem = options => () => {
  const {
    titleModule,
    leadModule,
    formatModule,
    paragraphModule
  } = getSubmodules(options)

  const data = getData({
    teaserType: options.rule.editorOptions.teaserType
  })

  return Block.create({
    type: options.TYPE,
    data,
    nodes: [
      Block.create({
        type: formatModule.TYPE,
        data
      }),
      Block.create({
        type: titleModule.TYPE,
        data
      }),
      Block.create({
        type: leadModule.TYPE,
        data
      }),
      Block.create({
        type: paragraphModule.TYPE,
        data
      })
    ]
  })
}

const teaserPlugin = options => {
  const { TYPE, rule } = options

  const {
    titleModule,
    leadModule,
    formatModule,
    paragraphModule
  } = getSubmodules(options)

  const Teaser = rule.component

  return {
    renderNode ({ editor, node, attributes, children }) {
      if (!matchBlock(TYPE)(node)) {
        return
      }
      const UI = TeaserInlineUI(options)

      return (
        <UI
          nodeKey={node.key}
          getIndex={getIndex(editor)}
          getParentKey={getParentKey(editor)}
          move={move(editor)}
          insert={insert(editor)}
        >
          <Teaser {...node.data.toJS()} attributes={attributes}>
            {children}
          </Teaser>
        </UI>
      )
    },
    onKeyDown (event, change) {
      if (event.key !== 'Enter') {
        return
      }
      if (change.value.isExpanded) {
        return change.collapseToEnd()
      } else if (change.value.blocks.size > 0) {
        return change.collapseToStartOf(
          change.value.document.getNextBlock(change.value.blocks.first().key)
        )
      }
    },
    schema: {
      blocks: {
        [TYPE]: {
          nodes: [
            {
              types: [formatModule.TYPE],
              min: 1,
              max: 1
            },
            {
              types: [titleModule.TYPE],
              min: 1,
              max: 1
            },
            {
              types: [leadModule.TYPE],
              min: 1,
              max: 1
            },
            {
              types: [paragraphModule.TYPE],
              min: 1,
              max: 1
            }
          ],
          normalize: (change, reason, context) => {
            const {
              index,
              node
            } = context
            switch (reason) {
              case 'child_type_invalid':
                if (index === 0) {
                  return change.insertNodeByKey(
                    node.key,
                    0,
                    {
                      kind: 'block',
                      type: formatModule.TYPE
                    }
                  )
                }
                if (index === 2) {
                  if (context.child.type === paragraphModule.TYPE) {
                    const t = change.insertNodeByKey(
                      node.key,
                      2,
                      {
                        kind: 'block',
                        type: leadModule.TYPE
                      }
                    )
                    return t
                  }
                }
                break
            }
            console.error({ reason, context: context.child.toJS() })
          }
        }
      }
    }
  }
}

export default options => ({
  helpers: {
    serializer: getSerializer(options)
  },
  plugins: [
    teaserPlugin(options)
  ],
  ui: {
    insertButtons: [
      TeaserButton(options)
    ],
    forms: [
      TeaserForm(options)
    ]
  }
})
