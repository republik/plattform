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
  id (user) {
    return user._raw.testimonialId
  },
  portrait,
  credentials,
  statement,
  sequenceNumber,
  updatedAt
}
