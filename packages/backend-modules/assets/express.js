module.exports = {
  frontend: (server) => {
    server.get('/frontend/:path(*)', require('./handlers/frontend'))
  },
  pdf: (server) => {
    server.get('/pdf/:path(*)', require('./handlers/pdf'))
  },
  proxy: (server) => {
    server.get('/proxy', require('./handlers/proxy'))
  },
  purge: (server) => {
    server.post('/purgeTags', require('./handlers/purgeTags'))
  },
  render: (server) => {
    server.get('/render', require('./handlers/render'))
  },
  s3: (server) => {
    server.get('/s3/:bucket/:path(*)', require('./handlers/s3'))
  },
}
