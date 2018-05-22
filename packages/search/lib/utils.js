const _ = require('lodash')

/**
 * A filter to remove nodes from an mdast with a predicate. Will remove a node
 * if returns true.
 *
 * @param  {Object}   node        mdast Object
 * @param  {Function} [predicate] Predicate function, receives node as argument
 * @return {Object}               Filtered mdast Object
 */
const mdastFilter = function (node, predicate = () => false) {
  // Return null if predicate is true.
  if (predicate(node)) {
    return null
  }

  // Return leaf if leaf has no children
  if (!node.children) {
    return node
  }

  // Return leaf with children, again filtered with predicate
  return {
    ...node,
    children: _.compact(node.children.map(child => {
      return mdastFilter(child, predicate)
    }))
  }
}

module.exports = {
  mdastFilter
}
