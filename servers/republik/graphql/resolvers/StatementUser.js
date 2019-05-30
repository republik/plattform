const {
  username,
  portrait,
  credentials,
  statement,
  sequenceNumber
} = require('./User.js')
const {
  updatedAt
} = require('@orbiting/backend-modules-auth/graphql/resolvers/User')

// name is provided by statement / nextStatement query
// no resolver for it mean, it's not filtered and always available
module.exports = {
  id (user) {
    return user._raw.testimonialId
  },
  username,
  portrait,
  credentials,
  statement,
  sequenceNumber,
  updatedAt
}
