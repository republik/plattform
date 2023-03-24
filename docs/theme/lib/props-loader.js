const docgen = require('react-docgen-typescript')

module.exports = function loader(content, map, meta) {
  const props = docgen.parse(this.resourcePath, {
    skipChildrenPropWithoutDoc: false,
    shouldExtractValuesFromUnion: true,
  })

  return `export default ${JSON.stringify(props)}`
}
