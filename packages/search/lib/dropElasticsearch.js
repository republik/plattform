const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')

const drop = async (prefix) => {
  if (!prefix) {
    throw new Error("can't drop, prefix not specified")
  }
  const elastic = Elasticsearch.connect()

  const indices = await elastic.cat.indices({
    h: ['index']
  })
    .then(stats => stats && stats.split('\n'))

  if (!indices || !indices.length) {
    return
  }

  await Promise.all(
    indices
      .filter(i => i.indexOf(prefix) === 0)
      .map(index => {
        console.log(`dropping es index: ${index}`)
        return elastic.indices.delete({
          index
        })
      })
  )
}

module.exports = drop
