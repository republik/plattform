const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

module.exports = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime (format ISO-8601)',
  parseValue (value) {
    return new Date(value)
  },
  serialize (value) {
    const date = (typeof value) === 'string'
      ? new Date(value)
      : value
    try {
      return date.toISOString()
    } catch(e) {
      console.error(value, e)
      return null
    }
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  }
})
