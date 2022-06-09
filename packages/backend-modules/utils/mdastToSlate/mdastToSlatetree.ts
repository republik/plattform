import type { MdastNode } from './NodeMapping'
const mapMdastToSlateNode = require('./NodeMapping')

function convertMdastToSlate(mdastTree: MdastNode) {
  const slateObject = mapMdastToSlateNode(mdastTree)
  console.log('slateObject', JSON.stringify(slateObject, null, 2))
  return slateObject
}

module.exports = convertMdastToSlate
