import React from 'react'
import { colors } from '@project-r/styleguide'
import { css, merge } from 'glamor'
import { matchBlock } from '../../utils'
import { FigureForm, FigureButton } from './ui'
import { FIGURE, FIGURE_IMAGE, FIGURE_CAPTION } from './constants'
import addValidation, { findOrCreate } from '../../utils/serializationValidation'
import { gray2x1 } from '../../utils/placeholder'
import { serializer as paragraphSerializer, PARAGRAPH } from '../paragraph'
import { Block } from 'slate'
import Placeholder from '../../Placeholder'
import { imageResizeUrl } from '../../../Templates/utils'

import MarkdownSerializer from '../../../../lib/serializer'

const mqMedium = '@media (min-width: 600px)'
const styles = {
  image: css({
    position: 'relative',
    width: '100%',
    outline: `4px solid transparent`,
    transition: 'outline-color 0.2s',
    '&[data-active="true"]': {
      outlineColor: colors.primary
    }
  }),
  figure: css({
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 10
  }),
  floatLeft: css({
    [mqMedium]: {
      float: 'left',
      width: '50%',
      marginTop: 3,
      marginRight: 20
    }
  }),
  floatRight: css({
    [mqMedium]: {
      float: 'right',
      width: '50%',
      marginTop: 3,
      marginLeft: 20
    }
  })
}

const Image = ({ src, alt, active, attributes = {} }) =>
  <img
    style={{ width: '100%' }}
    src={imageResizeUrl(src, '1200x')}
    alt={alt}
    data-active={active}
    {...styles.image}
    {...attributes}
  />

const figureCaption = {
  match: matchBlock(FIGURE_CAPTION),
  matchMdast: (node) => node.type === 'paragraph',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: FIGURE_CAPTION,
    data: node.data,
    nodes: paragraphSerializer.fromMdast(node).nodes
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'paragraph',
    children: paragraphSerializer.toMdast({
      kind: 'block',
      type: PARAGRAPH,
      nodes: object.nodes
    }).children
  }),
  placeholder: ({node}) => {
    if (node.text.length) return null

    return <Placeholder>Legende</Placeholder>
  },
  render: ({node, children, attributes}) => {
    return (
      <figcaption style={{
        textAlign: node.data.get('captionRight')
          ? 'right'
          : 'left',
        fontSize: 12,
        fontFamily: 'sans-serif',
        margin: 0,
        position: 'relative'
      }} {...attributes}>
        {children}
      </figcaption>
    )
  }
}
const figureImage = {
  match: matchBlock(FIGURE_IMAGE),
  matchMdast: (node) => node.type === 'image',
  fromMdast: (node, index, parent, visitChildren) => ({
    kind: 'block',
    type: FIGURE_IMAGE,
    data: {
      alt: node.alt,
      src: node.url
    },
    isVoid: true,
    nodes: []
  }),
  toMdast: (object, index, parent, visitChildren) => ({
    type: 'image',
    alt: object.data.alt,
    url: object.data.src
  }),
  render: ({ node, state, attributes }) => {
    const src = node.data.get('src') || gray2x1
    const alt = node.data.get('alt')
    const active = state.blocks.some(block => block.key === node.key)

    return (
      <Image
        attributes={attributes}
        src={src}
        alt={alt}
        active={active} />
    )
  }
}

const imageSerializer = new MarkdownSerializer({
  rules: [
    figureImage
  ]
})

const captionSerializer = new MarkdownSerializer({
  rules: [
    figureCaption
  ]
})

const figure = {
  match: matchBlock(FIGURE),
  matchMdast: (node) => node.type === 'zone' && node.identifier === FIGURE,
  fromMdast: (node, index, parent, visitChildren) => {
    const deepNodes = node.children.reduce(
      (children, child) => children
        .concat(child)
        .concat(child.children),
      []
    )
    const image = findOrCreate(deepNodes, {type: 'image'})
    const imageParent = node.children.find(n => n.children && n.children.indexOf(image) !== -1)

    const caption = {
      ...findOrCreate(
        node.children.filter(n => n !== imageParent),
        {type: 'paragraph'},
        {children: []}
      ),
      data: {
        captionRight: node.data.captionRight
      }
    }

    return {
      kind: 'block',
      type: FIGURE,
      data: {
        float: node.data.float
      },
      nodes: [
        imageSerializer.fromMdast(image),
        captionSerializer.fromMdast(caption)
      ]
    }
  },
  toMdast: (object, index, parent, visitChildren, context) => {
    if (object.nodes.length !== 2) {
      context.dirty = true
    } else if (object.nodes[0].type !== FIGURE_IMAGE || object.nodes[1].type !== FIGURE_CAPTION) {
      context.dirty = true
    }

    const image = findOrCreate(object.nodes, {
      kind: 'block',
      type: FIGURE_IMAGE
    }, {isVoid: true, data: {}})
    const caption = findOrCreate(object.nodes, {
      kind: 'block',
      type: FIGURE_CAPTION
    }, {nodes: [], data: {}})

    return {
      type: 'zone',
      identifier: FIGURE,
      data: {
        ...object.data,
        ...caption.data
      },
      children: [
        imageSerializer.toMdast(image),
        captionSerializer.toMdast(caption)
      ]
    }
  },
  render: ({ children, node, attributes }) => {
    return (
      <figure {...merge(
        styles.figure,
        node.data.get('float') === 'left' && styles.floatLeft,
        node.data.get('float') === 'right' && styles.floatRight
      )} {...attributes}>
        {children}
      </figure>
    )
  }
}

export const serializer = new MarkdownSerializer({
  rules: [
    figure
  ]
})

export const newBlock = () => Block.fromJSON(
  figure.fromMdast({
    children: [],
    data: {}
  })
)

addValidation(figure, serializer, 'figure')

export {
  FIGURE,
  FigureForm,
  FigureButton
}

export default {
  plugins: [
    {
      onKeyDown (event, change) {
        const isBackspace = event.key === 'Backspace'
        if (event.key !== 'Enter' && !isBackspace) return

        const { state } = change
        const inFigure = state.document.getClosest(
          state.focusBlock.key,
          matchBlock(FIGURE)
        )

        if (!inFigure) return

        event.preventDefault()

        if (isBackspace && state.focusBlock.type === FIGURE_IMAGE) {
          const isEmpty = !inFigure.text.trim()
          if (isEmpty) {
            return change
              .removeNodeByKey(inFigure.key)
          } else {
            return change.setNodeByKey(
              state.focusBlock.key,
              {
                data: {}
              }
            )
          }
        }
        if (!isBackspace && state.endBlock.type === FIGURE_CAPTION) {
          const parent = state.document.getParent(inFigure.key)
          const node = Block.create(PARAGRAPH)

          return change
            .insertNodeByKey(
              parent.key,
              parent.nodes.indexOf(inFigure) + 1,
              node
            )
            .collapseToEndOf(
              change.state.document.getNode(node.key)
            )
        }
      },
      schema: {
        rules: [
          figure,
          figureImage,
          figureCaption
        ]
      }
    }
  ]
}
