// const { run } = require('./server')
// run()
const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV) {
  require('dotenv').config()
}

const { makeExecutableSchema, mergeSchemas } = require('graphql-tools')
const t = require('./lib/t')

// middlewares
const assets = require('./express/assets')

// graphql schema
const executableSchema = mergeSchemas({
  schemas: [
    makeExecutableSchema(require('backend-modules-auth').graphql),
    makeExecutableSchema(require('backend-modules-documents').graphql),
    makeExecutableSchema(require('./graphql'))
  ]
})

const { server } = require('backend-modules-base')
// const server = require('./server')
server.run(executableSchema, [assets], t)
  .then(async (obj) => {
    const scheduler = require('./lib/publicationScheduler')
    await scheduler.init()
      .catch(error => { console.log(error); return error })
    return obj
  })
