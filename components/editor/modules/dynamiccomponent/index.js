import React from 'react'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

import createUi from './ui'

import EditOverlay from './EditOverlay'

import { SG_DYNAMIC_COMPONENT_BASE_URLS } from '../../../../lib/settings'

export default ({rule, subModules, TYPE}) => {
  const {
    identifier = 'DYNAMIC_COMPONENT'
  } = rule.editorOptions || {}

  const mdastRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node) => {
      const html = node.children.find(c => c.type === 'code' && c.lang === 'html')

      return ({
        kind: 'block',
        type: TYPE,
        data: {
          ...node.data,
          html: html
            ? html.value
            : ''
        },
        isVoid: true,
        nodes: []
      })
    },
    toMdast: (object) => {
      const { html, ...data } = object.data
      return {
        type: 'zone',
        identifier,
        data,
        children: [{
          type: 'code',
          lang: 'html',
          value: html
        }]
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      mdastRule
    ]
  })

  const DynamicComponent = rule.component

  const newBlock = () => Block.fromJSON(
    mdastRule.fromMdast({
      children: [],
      data: {
        src: (SG_DYNAMIC_COMPONENT_BASE_URLS || '').split(',')[0]
      }
    })
  )

  return {
    TYPE,
    helpers: {
      serializer,
      newBlock
    },
    changes: {},
    ui: createUi({
      TYPE,
      newBlock,
      editorOptions: rule.editorOptions
    }),
    plugins: [
      {
        renderNode (props) {
          const { node } = props
          if (node.type !== TYPE) return
          const data = node.data.toJS()
          const preview = <DynamicComponent
            showException
            key={JSON.stringify(data)}
            {...data} />

          return (
            <EditOverlay
              {...props}
              preview={preview} />
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
