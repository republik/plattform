import { renderSlateAsText } from '@project-r/styleguide'

export const SYNC_LIST = ['shareText']

export const SYNC_RULES = {
  shareText: {
    syncWithPath: [0, 2],
  },
}

export const getSyncText = (value, path) => {
  let node = value
  path.forEach((i) => {
    if (!node?.children) return ''
    node = node?.children[i]
  })
  return node?.children ? renderSlateAsText(node.children) : ''
}
