const sortBuilder = {
  relevance: (sort) => ({
    '_score': sort.direction
  }),
  publishedAt: (sort) => ({
    'meta.publishDate': {
      order: sort.direction || 'desc',
      unmapped_type: 'long'
    }
  }),
  mostRead: () => 'agg.views', // TODO
  mostDebated: () => 'agg.comments' // TODO
}

const createSort = (sort) => sortBuilder[sort.key](sort)

module.exports = {
  createSort
}
