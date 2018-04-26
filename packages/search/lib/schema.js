const buildSchema = (schema) => {
  return Object.keys(schema).reduce(
    (newSchema, schemaKey) => {
      const schemaEntry = schema[schemaKey]
      if (!schemaEntry.fieldPath) {
        throw new Error(`Invalid schema. Missing fieldPath for key: ${schemaKey}`)
      }
      return {
        ...newSchema,
        [schemaKey]: {
          ...schemaEntry,
          criteria:
            schemaEntry.criteria ||
              (schemaEntry.criteriaBuilder && schemaEntry.criteriaBuilder(schemaEntry.fieldPath)),
          agg:
            schemaEntry.agg ||
              (schemaEntry.aggBuilder && schemaEntry.aggBuilder(schemaEntry.fieldPath)(schemaKey))
        }
      }
    },
    {}
  )
}

module.exports = {
  buildSchema
}
