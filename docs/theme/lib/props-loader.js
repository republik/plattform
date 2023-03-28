/**
 * This is a CJS file because webpack can't deal with loader files in ESM format?
 */

module.exports = async function loader(content) {
  const callback = this.async()

  const docgen = await import('react-docgen')

  this.addContextDependency(this.resourcePath)
  try {
    // console.time('props-parse')

    const declarations = docgen.parse(content, {
      filename: this.resourcePath,
      resolver: new docgen.builtinResolvers.FindExportedDefinitionsResolver({
        limit: 0, // Allow multiple definitions per file
      }),
      importer: docgen.makeFsImporter(),
    })

    // console.timeEnd('props-parse')

    const declarationMap = {}

    for (const d of declarations) {
      const propsList = []
      for (const [name, props] of Object.entries(d.props ?? {})) {
        let type = props.tsType.name

        if (type === 'union') {
          type = props.tsType.raw
        }

        propsList.push({
          name,
          description: props.description,
          required: props.required,
          type,
          defaultValue: props.defaultValue
            ? props.defaultValue.value
            : undefined,
        })
      }

      declarationMap[d.displayName] = propsList
    }

    const result = `
  if (module.hot) { module.hot.accept([]) }
  module.exports = ${JSON.stringify(declarationMap)}
  `

    callback(null, result)
  } catch (e) {
    callback(e)
  }
  return
}
