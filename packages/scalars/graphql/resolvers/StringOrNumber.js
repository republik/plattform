const { GraphQLScalarType } = require('graphql')

module.exports = new GraphQLScalarType({
  name: 'StringOrNumber',
  description: 'String or number (input is casted to string)',
  parseValue (value) {
    return String(value)
  },
  parseLiteral (ast) {
    return String(ast.value)
  },
  serialize (value) {
    return value
  }
})
