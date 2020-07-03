const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')

const drop = async (prefix, { debug: doDebug = true } = {}) => {
  if (!prefix) {
    throw new Error("can't drop, prefix not specified")
  }
  const debug = doDebug === false
    ? () => {}
    : console.log

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
        debug(`dropping es index: ${index}`)
        return elastic.indices.delete({
          index
        })
      })
  )
}

module.exports = drop
