const fs = require('fs')
const path = require('path')
const _ = {
  pickBy: require('lodash.pickby'),
  merge: require('lodash.merge')
}
const { parse, print, Source } = require('graphql')

const isDirectory = (...paths) => {
  return fs.lstatSync(path.join(...paths)).isDirectory()
}

const requireDirectory = (root, except, flatify, ignoreDirectories) => {
  return fs.existsSync(root) && fs.readdirSync(root)
    .filter( file =>
      !(file.indexOf('.') === 0) && //exclude hidden
      (!except || except.indexOf(file) === -1)
    )
    .map( file => {
      if(isDirectory(root, file)) {
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
    .reduce( (result, file) => {
      return {
        ...file,
        ...result
      }
    }, {})
}

// loads a module from a directory
const loadModule = (root) => {
  const schema = [require(path.join(root, 'schema'))]
  const schemaTypes = [require(path.join(root, 'schema-types'))]
  const typeResolvers = requireDirectory(path.join(root, 'resolvers/'), ['_queries', '_mutations', '_subscriptions'])
  return {
    schema,
    schemaTypes,
    typeDefs: [...schema, ...schemaTypes],
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

  //deduplicate scalar types
  let masterScalarTypeDefs = []
  const parsedMasterSchemaTypes = parse(new Source(master.schemaTypes.join('\n')))
  parsedMasterSchemaTypes.definitions.forEach( def => {
    if(def.kind === 'ScalarTypeDefinition') {
      masterScalarTypeDefs.push(def.name.value)
    }
  })
  const parsedDonorSchemaTypes = parse(new Source(donor.schemaTypes.join('\n')))
  const deduplicatedDonorSchemaTypes = print({
    ...parsedDonorSchemaTypes,
    definitions: parsedDonorSchemaTypes.definitions.filter(
      def => masterScalarTypeDefs.indexOf(def.name.value) === -1
    )
  })

  const mergedSchemaTypes = [...master.schemaTypes, deduplicatedDonorSchemaTypes]
  return {
    ...master,
    schemaTypes: mergedSchemaTypes,
    typeDefs: [...master.schema, ...mergedSchemaTypes],
    resolvers: _.merge(master.resolvers, donor.typeResolvers)
  }
}

const addTypes = (master, donors) => {
  let newMaster = master
  for(let donor of donors) {
    newMaster = _addTypes(newMaster, donor)
  }
  return newMaster
}


module.exports = {
  loadModule,
  addTypes
}
