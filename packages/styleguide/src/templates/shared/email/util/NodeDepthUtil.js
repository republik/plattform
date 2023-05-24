import { matchType } from '@republik/mdast-react-render/lib/utils'

/**
 * Get the depth relative to closest ancestor that matches the given matcher
 *
 * If node is a direct child -> 0
 * Node is a nested child -> >= 1
 * If no parent matches -> -1
 *
 * @param ancestors
 * @param matcher
 * @returns {number}
 */
export function getNodeDepth(ancestors, matcher = matchType('root')) {
  let depth = 0
  for (let i = 0; i < ancestors.length; i++) {
    const node = ancestors[i]
    if (matcher(node)) return depth
    depth += 1
  }
  return -1
}
