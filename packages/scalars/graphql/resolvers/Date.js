const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')

const { utcTimeFormat, utcTimeParse } = require('@orbiting/backend-modules-formats')
const dateFormat = utcTimeFormat('%x') // %x - the locale’s date
const dateParse = utcTimeParse('%x %H %Z') // %x - the locale’s date, %H and %Z for timezone normalization

module.exports = new GraphQLScalarType({
  name: 'Date',
  description: 'Date (format %d.%m.%Y)',
  parseValue (value) {
    // parse dates as 12:00 Zulu
    return dateParse(value + ' 12 Z')
  },
  serialize (value) {
    // value is a js date at 12:00 Zulu
    // or an ISO String
    if ((typeof value) === 'string') {
      value = new Date(value)
    }
    return dateFormat(value)
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.STRING) {
      return dateParse(ast.value + ' 12 Z')
    }
    return null
  }
})
