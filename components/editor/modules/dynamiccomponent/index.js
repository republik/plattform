import React, { cloneElement } from 'react'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import MarkdownSerializer from 'slate-mdast-serializer'

import createUi from './ui'

import EditOverlay from './EditOverlay'

import { SG_DYNAMIC_COMPONENT_BASE_URLS } from '../../../../lib/settings'

import dynamicComponentRequire from './require'

export default ({ rule, subModules, TYPE }) => {
  const { identifier = 'DYNAMIC_COMPONENT' } = rule.editorOptions || {}

  const mdastRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: node => {
      const html = node.children.find(
        c => c.type === 'code' && c.lang === 'html'
      )

      return {
        kind: 'block',
        type: TYPE,
        data: {
          ...node.data,
          html: html ? html.value : ''
        },
        isVoid: true,
        nodes: []
      }
    },
    toMdast: object => {
      const { html, ...data } = object.data
      return {
        type: 'zone',
        identifier,
        data,
        children: html
          ? [
              {
                type: 'code',
                lang: 'html',
                value: html
              }
            ]
          : []
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [mdastRule]
  })

  const DynamicComponent = rule.component

  const newItem = () =>
    Block.create({
      type: TYPE,
      isVoid: true,
      data: {
        src: (SG_DYNAMIC_COMPONENT_BASE_URLS || '').split(',')[0],
        autoHtml: true
      }
    })

  return {
    TYPE,
    helpers: {
      serializer,
      newItem
    },
    changes: {},
    ui: createUi({
      TYPE,
      newItem,
      editorOptions: rule.editorOptions
    }),
    plugins: [
      {
        renderNode(props) {
          const { node } = props
          if (node.type !== TYPE) return
          const data = node.data.toJS()
          const component = (
            <DynamicComponent
              showException
              key={JSON.stringify(data)}
              require={dynamicComponentRequire}
              {...data}
            />
          )
          const preview = cloneElement(component, {
            raw: true
          })

          return (
            <EditOverlay {...props} component={component} preview={preview} />
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
