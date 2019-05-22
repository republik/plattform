const {
  portrait,
  credentials,
  statement,
  sequenceNumber
} = require('./User.js')
const {
  updatedAt
} = require('@orbiting/backend-modules-auth/graphql/resolvers/User')

module.exports = {
  portrait,
  credentials,
  statement,
  sequenceNumber,
  updatedAt
}
