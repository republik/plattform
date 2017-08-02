import { Block, Text } from 'slate'
import configureTypography from '../typography'

export const AlwaysTitleFirst = opts => {
  const constants = configureTypography(opts).Constants

  return {
    match: node => node.kind === 'document',
    validate: document =>
      !document.nodes.size ||
      document.nodes.first().type !== constants.H1
        ? document.nodes
        : null,
    normalize: (transform, document, nodes) => {
      if (
        nodes.first().kind !== 'block' ||
        nodes.first().type !== constants.H1
      ) {
        const title = Block.create({
          type: constants.H1,
          nodes: [Text.createFromString('')]
        })
        return transform.insertNodeByKey(
          document.key,
          0,
          title
        )
      }
      return transform
    }
  }
}

export const OnlyOneTitle = opts => {
  const constants = configureTypography(opts).Constants

  return {
    match: node => node.kind === 'document',
    validate: document => {
      const invalidChildren = document.nodes.filter(
        (child, index) =>
          child.type === constants.H1 && index !== 0
      )
      return invalidChildren.size ? invalidChildren : null
    },
    normalize: (transform, document, invalidChildren) => {
      let updatedTransform = transform
      invalidChildren.forEach(child => {
        updatedTransform = transform.setNodeByKey(
          child.key,
          constants.P
        )
      })

      return updatedTransform
    }
  }
}

export const OnlyOneLead = opts => {
  const constants = configureTypography(opts).Constants

  return {
    match: node => node.kind === 'document',
    validate: document => {
      const invalidChildren = document.nodes.filter(
        (child, index) =>
          child.type === constants.LEAD && index !== 1
      )
      return invalidChildren.size ? invalidChildren : null
    },
    normalize: (transform, document, invalidChildren) => {
      let updatedTransform = transform
      invalidChildren.forEach(child => {
        updatedTransform = transform.setNodeByKey(
          child.key,
          constants.P
        )
      })

      return updatedTransform
    }
  }
}

export default opts => [
  AlwaysTitleFirst(opts),
  OnlyOneLead(opts),
  OnlyOneTitle(opts)
]
