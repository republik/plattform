const { loadModule, addTypes, merge } = require('apollo-modules-node')
const { graphql: scalars } = require('@orbiting/backend-modules-scalars')

const local = addTypes(loadModule(__dirname), [scalars])

const { graphql: auth } = require('@orbiting/backend-modules-auth')
const crowdfundings = require('./modules/crowdfundings/graphql')

module.exports = merge(local, [crowdfundings, auth])
