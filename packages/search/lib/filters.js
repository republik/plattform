const termCriteriaBuilder = (fieldName) => (value) => ({
  clause: 'must',
  filter: {
    term: { [fieldName]: value }
  }
})

const hasCriteriaBuilder = (fieldName) => (value) => ({
  clause: value ? 'must' : 'must_not',
  filter: {
    exists: {
      field: fieldName
    }
  }
})

const dateRangeCriteriaBuilder = (fieldName) => (range) => ({
  clause: 'must',
  filter: {
    range: {
      [fieldName]: {
        gte: range.from,
        lte: range.to
      }
    }
  }
})

/*
const dateCriteriaBuilder = (fieldName, operator) => (date) => ({
  clause: 'must',
  filter: {
    range: {
      [fieldName]: {
        [operator]: date
      }
    }
  }
})
*/

// eslint-disable-next-line eqeqeq
const boolParser = (value) => value == true

const filterSchema = {
  dossier: {
    criteria: termCriteriaBuilder('meta.dossier')
  },
  format: {
    criteria: termCriteriaBuilder('meta.format')
  },
  template: {
    criteria: termCriteriaBuilder('meta.template')
  },
  userId: {
    parse: (value) => `/~${value}`,
    criteria: termCriteriaBuilder('meta.credits.url')
  },
  path: {
    criteria: termCriteriaBuilder('meta.path')
  },
  repoId: {
    criteria: termCriteriaBuilder('meta.repoId')
  },
  publishedAt: {
    parse: (value) => {
      const [from, to] = value.split(',')
      return {
        from: new Date(from),
        to: new Date(to)
      }
    },
    criteria: dateRangeCriteriaBuilder('meta.publishDate')
  },
  author: {
    criteria: termCriteriaBuilder('meta.author.keyword')
  },
  seriesMaster: {
    criteria: termCriteriaBuilder('meta.seriesMaster')
  },
  discussion: {
    parse: boolParser,
    criteria: hasCriteriaBuilder('meta.discussion')
  },
  feed: {
    parse: boolParser,
    criteria: hasCriteriaBuilder('meta.feed')
  },
  audio: {
    parse: boolParser,
    criteria: hasCriteriaBuilder('meta.audioSource.mp3')
  }
}

// converts a filter array (with generic value as string) to a (typed) filter obj
const filterReducer = (schema) => (filters) =>
  filters.reduce(
    (filterObj, { key, value }) => {
      const schemaEntry = schema[key]
      if (!schemaEntry) {
        console.warn('missing schemaEntry for filter:', { key, value })
        return filterObj
      }
      return {
        ...filterObj,
        [key]: schemaEntry.parse
          ? schemaEntry.parse(value)
          : value
      }
    },
    {}
  )

// converts a filter obj to elastic syntax
const elasticFilterBuilder = (schema) => (filter) =>
  Object.keys(filter).reduce(
    (boolFilter, key) => {
      const schemaEntry = schema[key]
      if (!schemaEntry) {
        throw new Error(`Missing filter schemaEntry for filter: ${key}`)
      }
      const criteria = schemaEntry.criteria
      if (!criteria) {
        throw new Error(`Missing filter criteria for filter: ${key}`)
      }

      const value = filter[key]
      const created = criteria(value)
      boolFilter[created.clause] = [...(boolFilter[created.clause] || []), created.filter]
      return boolFilter
    },
    {}
  )

module.exports = {
  reduceFilters: filterReducer(filterSchema),
  createElasticFilter: elasticFilterBuilder(filterSchema)
}
