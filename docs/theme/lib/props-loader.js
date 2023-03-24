/**
 * This is a CJS file because webpack can't deal with loader files in ESM format?
 */
const docgen = require('react-docgen-typescript')

module.exports = function loader() {
  const declarations = docgen.parse(this.resourcePath, {
    skipChildrenPropWithoutDoc: false,
    shouldExtractValuesFromUnion: true,
  })

  const declarationMap = {}

  for (const d of declarations) {
    const propsList = []
    for (const [name, props] of Object.entries(d.props)) {
      let type = props.type.name

      if (type === 'enum') {
        const unionValues = props.type.value.map((v) => v.value).join(' | ')

        type =
          props.type.raw === unionValues
            ? props.type.raw
            : `${props.type.raw} (${unionValues})`
      }

      propsList.push({
        name,
        description: props.description,
        required: props.required,
        type,
        defaultValue: props.defaultValue ? props.defaultValue.value : undefined,
      })
    }

    declarationMap[d.displayName] = propsList
  }

  return `
  if (module.hot) { module.hot.accept([]) }
  module.exports = ${JSON.stringify(declarationMap)}`
}
