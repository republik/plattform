import React from 'react'
import { List } from 'immutable'
import { Block, Text } from 'slate'

const CHILD_ORDER = List([
  'image',
  'imageCaption',
  'imageSource'
])

export const match = ({ kind, type }) =>
  kind === 'block' && type === 'imageWithCaption'

export const render = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
}

export const normalize = (transform, node, children) => {
  let updatedTransform = transform

  // Has no content -> delete -> abort
  if (children.size < 1) {
    return updatedTransform.removeNodeByKey(node.key)
  }

  // Has to many child nodes -> remove -> resume
  if (children.size > 3) {
    children.skip(3).forEach(v => {
      updatedTransform = updatedTransform.removeNodeByKey(
        v.key
      )
    })
  }

  // If first element is not an image, insert one -> resume
  if (children.get(0).type !== 'image') {
    updatedTransform = updatedTransform.insertNodeByKey(
      node.key,
      0,
      Block.create({
        type: 'image',
        isVoid: true,
        data: { src: '/static/example.jpg' }
      })
    )
  }

  // If has no second child element, insert one -> resume
  if (!children.get(1)) {
    updatedTransform = updatedTransform.insertNodeByKey(
      node.key,
      1,
      Block.create({
        type: 'imageCaption',
        nodes: [Text.createFromString('Caption')]
      })
    )
    // If has a second child element, but it's not a caption, change it -> resume
  } else if (children.get(1).type !== 'imageCaption') {
    updatedTransform = updatedTransform.setNodeByKey(
      children.get(1).key,
      { type: 'imageCaption' }
    )
  }

  // If has no third child element, insert one -> resume
  if (!children.get(2)) {
    updatedTransform = updatedTransform.insertNodeByKey(
      node.key,
      2,
      Block.create({
        type: 'imageSource',
        nodes: [Text.createFromString('Source')]
      })
    )
    // If has a third child element, but it's not a source, change it -> resume
  } else if (children.get(2).type !== 'imageSource') {
    updatedTransform = updatedTransform.setNodeByKey(
      children.get(2).key,
      { type: 'imageSource' }
    )
  }

  return updatedTransform
}

export const validate = node => {
  const children = node.nodes
  if (
    children.size !== 3 ||
    !children.every((v, k) => v.type === CHILD_ORDER.get(k))
  ) {
    return children
  }
}

export default {
  match,
  render,
  validate,
  normalize
}
