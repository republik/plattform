import { matchBlock } from './index'

export const matchAncestor = TYPE => value =>
  value.blocks.reduce(
    (memo, node) =>
      memo || value.document.getFurthest(node.key, matchBlock(TYPE)),
    undefined
  )
