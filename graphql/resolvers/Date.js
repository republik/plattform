const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

module.exports = new GraphQLScalarType({
  name: 'Date',
  description: 'Date (format YYYY-MM-DD)',
  parseValue (value) {
    // parse dates as 12:00 Zulu
    return new Date(value + 'T12:00:00.000Z')
  },
  serialize (value) {
    // value is a js date at 12:00 Zulu
    // or an ISO String
    const date = (typeof value) === 'string'
      ? new Date(value)
      : value
    return date.toISOString().split('T')[0]
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value + 'T12:00:00.000Z')
    }
    return null
  }
})
