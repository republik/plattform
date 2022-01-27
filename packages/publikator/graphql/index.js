// for this module to work you either need to
// addTypes or merge @orbiting/backend-modules-documents
// addTypes or merge @orbiting/backend-modules-auth
const { loadModule, addTypes } = require('apollo-modules-node')
const { graphql: scalars } = require('@orbiting/backend-modules-scalars')
module.exports = addTypes(loadModule(__dirname), [scalars])
