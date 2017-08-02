import { Block, Text } from 'slate'

export const AlwaysTitleFirst = get => {
  return {
    match: node => node.kind === 'document',
    validate: document =>
      !document.nodes.size ||
      document.nodes.first().type !==
        get('Typography.Constants.H1')
        ? document.nodes
        : null,
    normalize: (transform, document, nodes) => {
      if (
        nodes.first().kind !== 'block' ||
        nodes.first().type !==
          get('Typography.Constants.H1')
      ) {
        const title = Block.create({
          type: get('Typography.Constants.H1'),
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

export const OnlyOneTitle = get => {
  return {
    match: node => node.kind === 'document',
    validate: document => {
      const invalidChildren = document.nodes.filter(
        (child, index) =>
          child.type === get('Typography.Constants.H1') &&
          index !== 0
      )
      return invalidChildren.size ? invalidChildren : null
    },
    normalize: (transform, document, invalidChildren) => {
      let updatedTransform = transform
      invalidChildren.forEach(child => {
        updatedTransform = transform.setNodeByKey(
          child.key,
          get('Typography.Constants.P')
        )
      })

      return updatedTransform
    }
  }
}

export const OnlyOneLead = get => {
  return {
    match: node => node.kind === 'document',
    validate: document => {
      const invalidChildren = document.nodes.filter(
        (child, index) =>
          child.type === get('Typography.Constants.LEAD') &&
          index !== 1
      )
      return invalidChildren.size ? invalidChildren : null
    },
    normalize: (transform, document, invalidChildren) => {
      let updatedTransform = transform
      invalidChildren.forEach(child => {
        updatedTransform = transform.setNodeByKey(
          child.key,
          get('Typography.Constants.P')
        )
      })

      return updatedTransform
    }
  }
}

export default theme => [
  AlwaysTitleFirst(theme),
  OnlyOneLead(theme),
  OnlyOneTitle(theme)
]
