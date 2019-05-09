const elasticsearch = require('elasticsearch')

const connect = () =>
  new elasticsearch.Client({
    host: process.env.ELASTIC_URL || 'localhost:9200'
  })

const disconnect = client =>
  client.close()

module.exports = {
  connect,
  disconnect
}
