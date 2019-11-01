const { Client } = require('elasticsearch')

const connect = () =>
  new Client({
    host: process.env.ELASTIC_URL || 'localhost:9200',
    apiVersion: '6.3'
  })

const disconnect = client =>
  client.close()

module.exports = {
  connect,
  disconnect
}
