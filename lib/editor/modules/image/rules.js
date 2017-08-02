import React from 'react'
import constants from './constants'
import { Block, Text } from 'slate'

export const ImageWithCaption = ({ Image }) => ({
  match: ({ kind, type }) =>
    kind === 'block' &&
    type === constants.IMAGE_WITH_CAPTION,

  render: ({ children, ...props }) => {
    const [image, caption, source] = children
    return (
      <Image.Blocks.ImageWithCaption {...props}>
        {image}
        <Image.Blocks.CaptionSection>
          {caption}
          {source}
        </Image.Blocks.CaptionSection>
      </Image.Blocks.ImageWithCaption>
    )
  }
})

export const Image = ({ Image }) => ({
  match: ({ kind, type }) =>
    kind === 'block' && type === constants.IMAGE,

  render: props => {
    const { node } = props
    const src = node.data.get('src')
    if (src) {
      return (
        <Image.Blocks.Image
          src={node.data.get('src')}
          {...props}
        />
      )
    }
    return <Image.Blocks.ImagePlaceholder {...props} />
  }
})

export const ImageCaption = ({ Image }) => ({
  match: ({ kind, type }) =>
    kind === 'block' && type === constants.IMAGE_CAPTION,

  render: props => <Image.Blocks.ImageCaption {...props} />
})

export const ImageSource = ({ Image }) => ({
  match: ({ kind, type }) =>
    kind === 'block' && type === constants.IMAGE_SOURCE,

  render: props => <Image.Blocks.ImageSource {...props} />
})

export const NeverEmpty = () => ({
  match: ({ kind, type }) =>
    kind === 'block' &&
    type === constants.IMAGE_WITH_CAPTION,
  validate: node => {
    return node.nodes.size < 1 ? node : null
  },

  normalize: (transform, node) => {
    return transform.removeNodeByKey(node.key)
  }
})

export const AlwaysThreeChildren = () => ({
  match: ({ kind, type }) =>
    kind === 'block' &&
    type === constants.IMAGE_WITH_CAPTION,
  validate: node => {
    return node.nodes.size > 3 ? node.nodes : null
  },

  normalize: (transform, node, children) => {
    let updatedTransform = transform
    children.skip(3).forEach(v => {
      updatedTransform = updatedTransform.removeNodeByKey(
        v.key
      )
    })
    return transform
  }
})

export const AlwaysImageFirst = () => ({
  match: ({ kind, type }) =>
    kind === 'block' &&
    type === constants.IMAGE_WITH_CAPTION,
  validate: node => {
    return node.nodes.get(0).type !== constants.IMAGE
      ? node.nodes
      : null
  },

  normalize: (transform, node, children) => {
    return transform.insertNodeByKey(
      node.key,
      0,
      Block.create({
        type: constants.IMAGE,
        isVoid: true
      })
    )
  }
})

export const AlwaysCaptionSecond = () => ({
  match: ({ kind, type }) =>
    kind === 'block' &&
    type === constants.IMAGE_WITH_CAPTION,
  validate: node => {
    if (!node.nodes.get(1)) {
      return node
    } else if (
      node.nodes.get(1).type !== constants.IMAGE_CAPTION
    ) {
      return node.nodes.get(1)
    }
  },

  normalize: (transform, node, captionNode) => {
    let updatedTransform = transform
    if (
      captionNode === node ||
      captionNode.type === constants.IMAGE_SOURCE
    ) {
      updatedTransform = updatedTransform.insertNodeByKey(
        node.key,
        1,
        Block.create({
          type: constants.IMAGE_CAPTION,
          nodes: [Text.createFromString('')]
        })
      )
    } else {
      updatedTransform = updatedTransform.setNodeByKey(
        captionNode.key,
        { type: constants.IMAGE_CAPTION }
      )
    }
    return updatedTransform
  }
})

export const AlwaysSourceThird = () => ({
  match: ({ kind, type }) =>
    kind === 'block' &&
    type === constants.IMAGE_WITH_CAPTION,
  validate: node => {
    if (!node.nodes.get(2)) {
      return node
    } else if (
      node.nodes.get(2).type !== constants.IMAGE_SOURCE
    ) {
      return node.nodes.get(2)
    }
  },

  normalize: (transform, node, sourceNode) => {
    let updatedTransform = transform
    if (sourceNode === node) {
      updatedTransform = updatedTransform.insertNodeByKey(
        node.key,
        2,
        Block.create({
          type: constants.IMAGE_SOURCE,
          nodes: [Text.createFromString('')]
        })
      )
    } else {
      updatedTransform = updatedTransform.setNodeByKey(
        sourceNode.key,
        { type: constants.IMAGE_SOURCE }
      )
    }
    return updatedTransform
  }
})

export default opts => [
  NeverEmpty(opts),
  AlwaysThreeChildren(opts),
  AlwaysImageFirst(opts),
  AlwaysCaptionSecond(opts),
  AlwaysSourceThird(opts),
  ImageWithCaption(opts),
  Image(opts),
  ImageCaption(opts),
  ImageSource(opts)
]
