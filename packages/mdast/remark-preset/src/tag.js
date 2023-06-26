import * as zone from './zone'

export const collapse = tag => zone.collapse({
  test: ({type, value}) => {
    if (type !== 'html') {
      return
    }
    if (value === `<${tag}>`) {
      return 'start'
    }
    if (value === `</${tag}>`) {
      return 'end'
    }
  },
  mutate: (start, nodes, end) => {
    return {
      type: tag,
      children: nodes
    }
  }
})

export const expand = tag => zone.expand({
  test: ({type}) => type === tag,
  mutate: node => [
    {
      type: 'html',
      value: `<${tag}>`
    },
    ...node.children,
    {
      type: 'html',
      value: `</${tag}>`
    }
  ]
})
