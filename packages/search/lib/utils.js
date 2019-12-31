const _ = require('lodash')

const { mdastToString } = require('@orbiting/backend-modules-utils')

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

const mdastContentToString = mdast =>
  mdastToString(
    mdastFilter(
      mdast,
      node =>
        node.type === 'code' ||
        ['TITLE', 'ARTICLECOLLECTION', 'INFOBOX', 'FIGURE', 'NOTE', 'HTML'].includes(node.identifier)
    ),
    '\n'
  )
    .replace(/\u00AD/g, '') // 0x00AD = Soft Hyphen (SHY)
    .trim()

module.exports = {
  getIndexAlias,
  getDateTimeIndex,
  getDateIndex,
  mdastFilter,
  mdastContentToString
}
