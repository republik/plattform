// TODO: resolver for form-schema for a given type

import { loadEntities } from '../lib/utils/EntityResolver'

// TODO: dynamically generete create{ENTITY} quieries
// TODO: dynamically update{ENTITY}/delete{ENTITY} mutations
function capitalize(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1)
}

const schema = (function () {
  const entities = loadEntities()
  const entityResolvers = entities.reduce(
    (
      x: {
        queries: string[]
        mutations: string[]
      },
      entity,
    ) => {
      const entityName = capitalize(entity)
      x.queries.push(`cms${entityName}s: [${entityName}!]!`)
      x.queries.push(`cms${entityName}(id: ID!): ${entityName}!`)
      x.mutations.push(
        `cmsCreate${entityName}(input: ${entityName}Input!): ${entityName}!`,
      )
      x.mutations.push(
        `cmsUpdate${entityName}(id: ID!, input: ${entityName}Input!): ${entityName}!`,
      )
      x.mutations.push(`cmsDelete${entityName}(id: ID!): ${entityName}!`)
      return x
    },
    { queries: [], mutations: [] },
  )
  const out = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  ${entityResolvers.queries.join('\n  ')}
}

type mutations {
  ${entityResolvers.mutations.join('\n  ')}
}
`

  return out
})()

module.exports = schema
