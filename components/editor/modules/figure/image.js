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
    matchMdast: rule.matchMdast,
    fromMdast: node => {
      const imageNodes = node.children.filter(child => child.type === 'image')
      return {
        kind: 'block',
        type: TYPE,
        data: {
          alt: imageNodes[0].alt,
          src: imageNodes[0].url,
          srcDark: imageNodes.length === 2 ? imageNodes[1].url : null
        },
        isVoid: true,
        nodes: []
      }
    },
    toMdast: object => {
      const mainImage = {
        type: 'image',
        alt: object.data.alt,
        url: object.data.src
      }
      return {
        type: 'paragraph',
        children: object.data.srcDark
          ? [
              mainImage,
              { type: 'text', value: ' ' },
              { type: 'image', alt: object.data.alt, url: object.data.srcDark }
            ]
          : [mainImage]
      }
    }
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
                srcNeg={node.data.get('srcDark')}
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
