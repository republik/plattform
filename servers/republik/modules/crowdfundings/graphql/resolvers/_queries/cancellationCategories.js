const { parse, Source } = require('graphql')
const Schema = require('../../schema-types')

const HIDDEN_CATEGORIES = ['SYSTEM']
const MORE_CATEGORIES = ['EDITORAL_NARCISSISTIC', 'LOGIN_TECH', 'PAPER', 'EXPECTIONS', 'RARELY_READ', 'TOO_MUCH_TO_READ', 'CROWFUNDING_ONLY', 'SEVERAL_REASONS']

const cancellationCategories = parse(new Source(Schema))
  .definitions.find(
    definition =>
      definition.kind === 'EnumTypeDefinition' &&
      definition.name &&
      definition.name.value === 'CancellationCategoryType'
  )
  .values.map(value => value.name.value)
  .filter(value => !HIDDEN_CATEGORIES.includes(value))

module.exports = (_, { showMore }, { pgdb, t }) => {
  if (!showMore) {
    return cancellationCategories
      .filter(value => !MORE_CATEGORIES.includes(value))
      .map(type => ({ type }))
  }
  return cancellationCategories
    .map(type => ({ type }))
}
