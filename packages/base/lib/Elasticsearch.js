const { Client } = require('elasticsearch')

const connect = () =>
  new Client({
    host: process.env.ELASTIC_URL || 'localhost:9200',
    apiVersion: '6.3'
  })

const disconnect = client =>
  client.close()

const scroll = async function * (client, params) {
  let response = await client.search(params)

  while (true) {
    const sourceHits = response.hits.hits

    if (sourceHits.length === 0) {
      break
    }

    for (const hit of sourceHits) {
      yield hit
    }

    if (!response._scroll_id) {
      break
    }

    response = await client.scroll({
      scrollId: response._scroll_id,
      scroll: params.scroll
    })
  }
}

module.exports = {
  connect,
  disconnect,
  scroll
}
