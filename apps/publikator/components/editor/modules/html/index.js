import React from 'react'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'
import { Block } from 'slate'

import { matchBlock } from '../../utils'
import { gray2x1 } from '../../utils/placeholder'
import MarkdownSerializer from 'slate-mdast-serializer'

import createUi from './ui'

import { matchImage } from 'mdast-react-render/lib/utils'

const styles = {
  border: css({
    display: 'inline-block',
    outline: `4px solid transparent`,
    width: '100%',
    lineHeight: 0,
    transition: 'outline-color 0.2s',
    '&[data-active="true"]': {
      outlineColor: colors.primary
    }
  })
}

export default ({ rule, subModules, TYPE }) => {
  const { identifier = 'HTML' } = rule.editorOptions || {}

  const mdastRule = {
    match: matchBlock(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: node => {
      const deepNodes = node.children
        .reduce(
          (children, child) => children.concat(child).concat(child.children),
          []
        )
        .filter(Boolean)
      const images = deepNodes.filter(matchImage).map(image => ({
        ref: image.alt,
        url: image.url
      }))

      const code = node.children.find(c => c.type === 'code')

      return {
        kind: 'block',
        type: TYPE,
        data: {
          images,
          code: code ? code.value : ''
        },
        isVoid: true,
        nodes: []
      }
    },
    toMdast: object => {
      const { images, code } = object.data
      return {
        type: 'zone',
        identifier,
        children: images
          .map(({ ref, url }) => ({
            type: 'image',
            url,
            alt: ref
          }))
          .concat({
            type: 'code',
            lang: 'html',
            value: code
          })
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [mdastRule]
  })

  const Html = rule.component

  const newBlock = () =>
    Block.fromJSON(
      mdastRule.fromMdast({
        children: [],
        data: {}
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
        renderNode(props) {
          const { node, editor, attributes } = props
          if (node.type !== TYPE) return
          const active = editor.value.blocks.some(
            block => block.key === node.key
          )
          return (
            <span {...styles.border} {...attributes} data-active={active}>
              <Html
                code={
                  node.data.get('code') ||
                  `<img width="100%" src="${gray2x1}" />`
                }
                images={node.data.get('images')}
              />
            </span>
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
