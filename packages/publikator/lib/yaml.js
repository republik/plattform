const yaml = require('js-yaml')
const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')

const stringify = (obj, footer, header) => {
  const message =
    (header ? `${header}\n` : '') +
    '---\n' +
    yaml.safeDump(
      omitBy(obj, isNil)
    ) +
    '---\n' +
    (footer ? `\n${footer}` : '')
  return message
}

const parse = (content) => {
  let parsedMessage
  try {
    const body = content.match(/---\n([\s\S]*?)\n---/)[1] || ''
    parsedMessage = yaml.safeLoad(body)
  } catch (e) { }
  return parsedMessage || {}
}

module.exports = {
  parse,
  stringify
}
