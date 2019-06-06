const {
  slug,
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
  slug,
  username: slug, // deprecated
  portrait: (obj, args, context) => portrait(obj, args, { ...context, allowAccess: true }),
  credentials,
  statement,
  sequenceNumber,
  updatedAt
}
