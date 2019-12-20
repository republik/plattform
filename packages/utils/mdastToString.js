/**
 * This is an adopted version of
 * https://github.com/syntax-tree/mdast-util-to-string
 *
 * Changes:
 * - Glues children with a whitespace
 */

module.exports = toString

/* Get the text content of a node.  If the node itself
 * does not expose plain-text fields, `toString` will
 * recursivly try its children. */
function toString (node, glue = ' ') {
  return (
    valueOf(node) ||
    (
      node.children &&
      node.children
        .map(child => toString(child, glue))
        .concat(['paragraph', 'heading'].includes(node.type) ? glue : '')
        .join('')
    ) ||
    (node.type === 'break' ? glue : '')
  )
}

/* Get the value of `node`.  Checks, `value`,
 * `alt`, and `title`, in that order. */
function valueOf (node) {
  return (
    (node && node.value ? node.value : node.alt ? node.alt : node.title) || false
  )
}
