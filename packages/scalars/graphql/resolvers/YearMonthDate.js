const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

module.exports = new GraphQLScalarType({
  name: 'YearMonthDate',
  description: 'YearMonthDate (format YYYY-MM)',
  parseValue (value) {
    console.log(value)
    return new Date(`${value}-01`)
  },
  serialize (value) {
    console.log(value)
    const date = (typeof value) === 'string'
      ? new Date(`${value}-01`)
      : value

    try {
      return date.toISOString()
    } catch (e) {
      console.error(value, e)
      return null
    }
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(`${ast.value}-01`)
    }
    return null
  }
})
