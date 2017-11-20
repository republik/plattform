const { loadModule, addTypes } = require('apollo-modules-node')
const { graphql: documents } = require('backend-modules-documents')
const { graphql: auth } = require('backend-modules-auth')
module.exports = addTypes(loadModule(__dirname), [auth, documents])
