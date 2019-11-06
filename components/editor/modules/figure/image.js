import React from 'react'
import { css } from 'glamor'
import { colors } from '@project-r/styleguide'

import { matchBlock } from '../../utils'
import { gray2x1 } from '../../utils/placeholder'
import MarkdownSerializer from 'slate-mdast-serializer'

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
  const Image = rule.component

  const figureImage = {
    match: matchBlock(TYPE),
    matchMdast: node => node.type === 'image',
    fromMdast: node => {
      return {
        kind: 'block',
        type: TYPE,
        data: {
          alt: node.alt,
          src: node.url
        },
        isVoid: true,
        nodes: []
      }
    },
    toMdast: object => ({
      type: 'image',
      alt: object.data.alt,
      url: object.data.src
    })
  }

  const serializer = new MarkdownSerializer({
    rules: [figureImage]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
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
              <Image
                src={node.data.get('src') || gray2x1}
                alt={node.data.get('alt')}
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
