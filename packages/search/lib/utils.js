const _ = require('lodash')

const ES_INDEX_PREFIX = process.env.ES_INDEX_PREFIX || 'republik'

/**
 * @example "2018-05-24-17-05-23"
 * @return {String} [description]
 */
const getDateTime =
  () => new Date().toISOString().slice(0, -5).replace(/[^\d]/g, '-')

/**
 * @example "2018-05-24"
 * @return {String} [description]
 */
const getDate =
  () => new Date().toISOString().slice(0, -14).replace(/[^\d]/g, '-')

/**
 * @param  {String} name An index name without prefix
 * @param  {String} type Operation, like "read", "write"
 * @return {String}      An alias name for an index
 */
const getIndexAlias =
  (name, type) => [ES_INDEX_PREFIX, name, type].filter(Boolean).join('-')

/**
 * @param  {String} name An index name without prefix
 * @return {String}      An index name with a date timestamp
 */
const getDateTimeIndex =
  (name) => [ES_INDEX_PREFIX, name, getDateTime()].filter(Boolean).join('-')

/**
 * @param  {String} name An index name without prefix
 * @return {String}      An index name with a date
 */
const getDateIndex =
  (name) => [ES_INDEX_PREFIX, name, getDate()].filter(Boolean).join('-')

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

/**
 * Converts an mdast tree into a plain text string. It is based on
 * https://github.com/syntax-tree/mdast-util-to-string but glues strings with
 * a space instead of nothing.
 *
 * @param  {Object} node                  mdast Object
 * @param  {String} [parentSeparator=' '] String to glue paragraphs with
 * @return {String}                       Plain text
 */
const mdastPlain = function (node, parentSeparator = ' ') {
  const valueOf =
    node &&
    node.value
      ? node.value
      : node.alt
        ? node.alt
        : node.title

  const separator = node && node.type === 'paragraph'
    ? ''
    : parentSeparator

  return (
    valueOf ||
    (node.children &&
      node.children
        .map(child => mdastPlain(child, separator))
        .join(separator)
        .trim()) ||
    ''
  )
}

module.exports = {
  getIndexAlias,
  getDateTimeIndex,
  getDateIndex,
  mdastFilter,
  mdastPlain
}
