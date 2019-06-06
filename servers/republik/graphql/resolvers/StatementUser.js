const {
  slug,
  portrait,
  credentials
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
  slug,
  credentials,
  updatedAt,
  portrait: (user, args, context) => portrait(user, args, { ...context, allowAccess: true }),
  sequenceNumber: (user, args, context) => user._raw.sequenceNumber,
  statement: (user, args, context) => user._raw.statement
}
