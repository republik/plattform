module.exports = async (_, { search }, { user, elastic }) => {
  const result = await elastic.search({
    index: 'documents',
    q: search
  })

  return result.hits.hits
    .map(h => h._source)
}
