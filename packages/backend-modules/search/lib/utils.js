const ES_INDEX_PREFIX = process.env.ES_INDEX_PREFIX || 'republik'

/**
 * @example "2018-05-24-17-05-23"
 * @return {String} [description]
 */
const getDateTime = () =>
  new Date().toISOString().slice(0, -5).replace(/[^\d]/g, '-')

/**
 * @param  {String} name An index name without prefix
 * @param  {String} type Operation, like "read", "write"
 * @return {String}      An alias name for an index
 */
const getIndexAlias = (name, type) =>
  [ES_INDEX_PREFIX, name, type].filter(Boolean).join('-')

/**
 * @param  {String} name An index name without prefix
 * @return {String}      An index name with a date timestamp
 */
const getDateTimeIndex = (name) =>
  [ES_INDEX_PREFIX, name, getDateTime()].filter(Boolean).join('-')

module.exports = {
  getIndexAlias,
  getDateTimeIndex,
}
