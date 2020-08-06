import {default as lib} from './lib'

export default {
  ...lib,
  graphql: require('./graphql'),
  express: require('./express')
}

export const transformUser = lib.transformUser