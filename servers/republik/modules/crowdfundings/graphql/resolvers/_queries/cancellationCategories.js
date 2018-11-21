const { parse, Source } = require('graphql')
const Schema = require('../../schema-types')

const cancellationCategories = parse(new Source(Schema))
  .definitions.find(
    definition =>
      definition.kind === 'EnumTypeDefinition' &&
      definition.name &&
      definition.name.value === 'CancellationCategoryType'
  )
  .values.map(value => value.name.value)
  .filter(value => value !== 'SYSTEM')

module.exports = (_, args, { pgdb, t }) => {
  return cancellationCategories.map(type => ({
    type
  }))
}
