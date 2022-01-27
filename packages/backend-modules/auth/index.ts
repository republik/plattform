import lib from './lib'

export = {
  ...lib,
  graphql: require('./graphql'),
  express: require('./express'),
}
