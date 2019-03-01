const fs = require('fs')
const path = require('path')
const _ = {
  pickBy: require('lodash.pickby'),
  merge: require('lodash.merge'),
  clone: require('lodash.clone')
}
const { parse, print, Source } = require('graphql')

const isDirectory = (...paths) => {
  return fs.lstatSync(path.join(...paths)).isDirectory()
}

const requireDirectory = (root, except, flatify, ignoreDirectories) => {
  return fs.existsSync(root) && fs.readdirSync(root)
    .filter(file =>
      !(file.indexOf('.') === 0) && // exclude hidden
      (!except || except.indexOf(file) === -1)
    )
    .map(file => {
      if (isDirectory(root, file)) {
        if (!ignoreDirectories) {
          if (flatify) {
            return { ...requireDirectory(path.join(root, file), [], flatify, true) }
          } else {
            return { [file]: requireDirectory(path.join(root, file)) }
          }
        }
      } else {
        return { [file.split('.')[0]]: require(path.join(root, file)) }
      }
    })
    .reduce((result, file) => {
      return {
        ...file,
        ...result
      }
    }, {})
}

// loads a module from a directory
const loadModule = (root) => {
  const schema = [require(path.join(root, 'schema'))]
  let schemaTypes
  try {
    schemaTypes = [require(path.join(root, 'schema-types'))]
  } catch { }
  const typeResolvers = requireDirectory(path.join(root, 'resolvers/'), ['_queries', '_mutations', '_subscriptions'])
  return {
    schema,
    schemaTypes,
    typeDefs: [...schema, ...schemaTypes || []],
    typeResolvers,
    resolvers: _.pickBy({
      queries: requireDirectory(path.join(root, 'resolvers/', '_queries/'), [], true),
      mutations: requireDirectory(path.join(root, 'resolvers/', '_mutations/'), [], true),
      subscriptions: requireDirectory(path.join(root, 'resolvers/', '_subscriptions/'), [], true),
      ...typeResolvers
    }, Boolean)
  }
}

// returns a new instance of master including the types of donor
const _addTypes = (master, donor) => {
  if (Object.keys(donor).length === 0) {
    console.error('cycle detected! Cyclic dependencies can not be resolved by this lib.')
    return master
  }

  // deduplicate scalar types
  let masterScalarTypeDefs = []
  const parsedMasterSchemaTypes = parse(new Source(master.schemaTypes.join('\n')))
  parsedMasterSchemaTypes.definitions.forEach(def => {
    if (def.kind === 'ScalarTypeDefinition') {
      masterScalarTypeDefs.push(def.name.value)
    }
  })

  let mergedSchemaTypes = [...master.schemaTypes]
  if (donor.schemaTypes) {
    const parsedDonorSchemaTypes = parse(new Source(donor.schemaTypes.join('\n')))

    const deduplicatedDonorSchemaTypes = print({
      ...parsedDonorSchemaTypes,
      definitions: parsedDonorSchemaTypes.definitions.filter(
        def => !def.name || masterScalarTypeDefs.indexOf(def.name.value) === -1
      )
    })
    mergedSchemaTypes.push(deduplicatedDonorSchemaTypes)
  }

  return {
    ...master,
    schemaTypes: mergedSchemaTypes,
    typeDefs: [...master.schema, ...mergedSchemaTypes],
    resolvers: _.merge(_.clone(donor.typeResolvers), master.resolvers)
  }
}

const _mergeSchema = (module1, module2) => {
  const parsedModule1Schema = parse(new Source(module1.schema.join('\n')))
  const parsedModule2Schema = parse(new Source(module2.schema.join('\n')))
  const mergedSchema = {
    kind: 'Document',
    definitions: [
      ...parsedModule1Schema.definitions.filter(def => def.kind === 'SchemaDefinition'),
      ...parsedModule1Schema.definitions
        .filter(def => def.kind === 'ObjectTypeDefinition')
        .map(def => {
          const objectTypeDefsModule2 = parsedModule2Schema.definitions
            .find(def2 =>
              def2.kind === 'ObjectTypeDefinition' &&
              def2.name.value === def.name.value
            )
          return {
            ...def,
            fields: [
              ...def.fields,
              ...objectTypeDefsModule2 ? objectTypeDefsModule2.fields : []
            ]
          }
        })
    ]
  }

  return print(mergedSchema)
}

const _merge = (module1, module2) => {
  const newModule = _addTypes(module1, module2)
  const newSchema = _mergeSchema(module1, module2)

  return {
    ...newModule,
    schema: [newSchema],
    typeDefs: [newSchema, ...newModule.schemaTypes],
    resolvers: {
      ...newModule.resolvers,
      queries: _.merge(module2.resolvers.queries, module1.resolvers.queries),
      mutations: _.merge(module2.resolvers.mutations, module1.resolvers.mutations),
      subscriptions: _.merge(module2.resolvers.subscriptions, module1.resolvers.subscriptions)
    },
    inheritResolversFromInterfaces: true
  }
}

const addTypes = (master, donors) => {
  let newMaster = master
  for (let donor of donors) {
    newMaster = _addTypes(newMaster, donor)
  }
  return newMaster
}

const merge = (module1, modules) => {
  let newModule = module1
  for (let module of modules) {
    newModule = _merge(newModule, module)
  }
  return newModule
}

module.exports = {
  loadModule,
  addTypes,
  merge
}
