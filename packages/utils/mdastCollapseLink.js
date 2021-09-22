const visit = require('unist-util-visit')

const DEFAULT_PREFIX_LENGTH = 35
const DEFAULT_POSTFIX_LENGTH = 10
const DEFAULT_COLLASPE_CHAR = '…'

module.exports = function mdastCollapseLink(node_, options = {}) {
  const node = JSON.parse(JSON.stringify(node_))

  const {
    prefixLength = DEFAULT_PREFIX_LENGTH,
    postfixLength = DEFAULT_POSTFIX_LENGTH,
    collapseChar = DEFAULT_COLLASPE_CHAR,
  } = options

  // Collapse links (URL) longer than 45 chars
  visit(node, 'link', (node) => {
    if (
      node.children.length === 1 &&
      node.children[0].value.length > prefixLength + postfixLength + 1 &&
      node.children[0].value === node.url
    ) {
      node.children[0].value = [
        node.children[0].value.slice(0, prefixLength),
        collapseChar,
        node.children[0].value.slice(0 - postfixLength),
      ].join('')
    }
  })

  return node
}
