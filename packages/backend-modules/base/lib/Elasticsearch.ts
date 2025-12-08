import { Client } from '@elastic/elasticsearch'
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types'

const connect = (node: string) =>
  new Client({
    node:
      node ||
      process.env.ELASTIC_URL ||
      'http://elastic:elastic@localhost:9200',
    requestTimeout: 600000,
  })

const disconnect = (client: Client) => client.close()

const scroll = async function* (client: Client, params: SearchRequest) {
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
      scroll_id: response._scroll_id,
      scroll: params.scroll,
    })
  }
}

export = {
  connect,
  disconnect,
  scroll,
}
