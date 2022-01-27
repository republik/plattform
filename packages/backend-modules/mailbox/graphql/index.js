const { loadModule, addTypes } = require('apollo-modules-node')
const { graphql: scalars } = require('@orbiting/backend-modules-scalars')
module.exports = addTypes(loadModule(__dirname), [scalars])
