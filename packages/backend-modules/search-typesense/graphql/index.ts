import { loadModule, addTypes } from 'apollo-modules-node'
const { graphql: scalars } = require('@orbiting/backend-modules-scalars')

export = addTypes(loadModule(__dirname), [scalars])
