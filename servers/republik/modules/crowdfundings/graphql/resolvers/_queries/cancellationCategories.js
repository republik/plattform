const { parse, Source } = require('graphql')
const Schema = require('../../schema-types')

const cancelCategories = parse(new Source(Schema))
  .definitions.find(
    definition =>
      definition.kind === 'EnumTypeDefinition' &&
      definition.name &&
      definition.name.value === 'CancelCategoryType'
  )
  .values.map(value => value.name.value)

module.exports = (_, args, { pgdb, t }) => {
  return cancelCategories.map(type => ({
    type,
    label: t(`api/membership/cancel/category/${type}`)
  }))
}
