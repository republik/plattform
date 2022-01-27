const { Client } = require('@elastic/elasticsearch')

const connect = () =>
  new Client({
    node: process.env.ELASTIC_URL || 'http://elastic:elastic@localhost:9200',
  })

const disconnect = (client) => client.close()

const scroll = async function* (client, params) {
  let response = await client.search(params)

  while (true) {
    const sourceHits = response.body.hits.hits

    if (sourceHits.length === 0) {
      break
    }

    for (const hit of sourceHits) {
      yield hit
    }

    if (!response.body._scroll_id) {
      break
    }

    response = await client.scroll({
      scrollId: response.body._scroll_id,
      scroll: params.scroll,
    })
  }
}

module.exports = {
  connect,
  disconnect,
  scroll,
}
