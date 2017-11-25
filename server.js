const { server } = require('@orbiting/backend-modules-base')

// schema stitching has it's pitfalls (in the current version), when one
// schema extends another (local extends User of backend-modules-auth).
//   - we need to merge types manually here (with mergeObjectTypes)
//   - we need to provide the local resolvers to mergeSchemas resolvers,
//     otherwise the local resolvers don't get called, even tough mergeObjectTypes
//     seems to properly merge them :(
//
// [RFC] Next steps for schema stitching
// https://github.com/apollographql/graphql-tools/issues/495
//
// mergeSchemas breaks the recursive nature of resolvers
// https://github.com/apollographql/graphql-tools/issues/443
//
// mergeSchema - onTypeConflict shouldn't be called with built-in types
// https://github.com/apollographql/graphql-tools/issues/487

/*
const cloneDeep = require('lodash.clonedeep')
const { GraphQLObjectType } = require('graphql/type/definition')
const { mergeSchemas } = require('graphql-tools')

function mergeObjectTypes (leftType, rightType) {
  if (!rightType) {
    return leftType
  }
  if (leftType.constructor.name !== rightType.constructor.name) {
    throw new TypeError(`Cannot merge with different base type. this: ${leftType.constructor.name}, other: ${rightType.constructor.name}.`)
  }
  const mergedType = cloneDeep(leftType)
  mergedType.getFields() // Populate _fields
  for (const [key, value] of Object.entries(rightType.getFields())) {
    mergedType._fields[key] = value
  }
  if (leftType instanceof GraphQLObjectType) {
    mergedType._interfaces = Array.from(new Set(leftType.getInterfaces().concat(rightType.getInterfaces())))
  }
  //console.log('mergedType:', mergedType.getFields())
  return mergedType
}

const mergeTypes = [ 'User' ]
*/

module.exports.run = () => {
  // const { makeExecutableSchema, mergeSchemas } = require('graphql-tools')
  const { makeExecutableSchema } = require('graphql-tools')
  const t = require('./lib/t')

  const localModule = require('./graphql')

  // graphql schema
  /*
  const executableSchema = mergeSchemas({
    schemas: [
      makeExecutableSchema(require('@orbiting/backend-modules-auth').graphql),
      makeExecutableSchema(require('@orbiting/backend-modules-documents').graphql),
      makeExecutableSchema(localModule),
    ],
    //onTypeConflict: (leftType, rightType) => {
    //  if (mergeTypes.indexOf(leftType.toString()) > -1 && leftType instanceof GraphQLObjectType) {
    //    return mergeObjectTypes(leftType, rightType)
    //  }
    //  return leftType
    //},
    //resolvers: mergeInfo => localModule.typeResolvers
  })
  */
  const { merge } = require('apollo-modules-node')

  const { graphql: documents } = require('@orbiting/backend-modules-documents')

  const executableSchema = makeExecutableSchema(merge(localModule, [documents]))

  // middlewares
  const middlewares = []

  return server.run(executableSchema, middlewares, t)
}

module.exports.close = () => {
  server.close()
}
