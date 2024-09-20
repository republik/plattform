import { loadModule, addTypes } from 'apollo-modules-node'

export default addTypes(loadModule(__dirname), [])
