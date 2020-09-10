const { loadModule, addTypes } = require('apollo-modules-node')
const { graphql: scalars } = require('@orbiting/backend-modules-scalars')
const local = addTypes(loadModule(__dirname), [scalars])
module.exports = local
