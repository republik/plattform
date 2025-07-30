import { loadModule, addTypes } from 'apollo-modules-node'
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { graphql: scalars } = require('@orbiting/backend-modules-scalars')

export = addTypes(loadModule(__dirname), [scalars]) 