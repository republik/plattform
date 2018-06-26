const elasticsearch = require('elasticsearch')

const {
  ELASTIC_URL
} = process.env

module.exports.client = () => {
  return new elasticsearch.Client({
    host: ELASTIC_URL || 'localhost:9200'
  })
}
