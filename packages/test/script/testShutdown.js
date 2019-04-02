const log = require('why-is-node-running')
const path = require('path')

const serverName = 'publikator'


const relativeServerPath = `../../../servers/${serverName}/`

// load env of server
require('@orbiting/backend-modules-env').config(
  path.join(__dirname, relativeServerPath, '.env')
)
// require server's server.js and start
const Server = require(`${relativeServerPath}server`)


Server.start()
  .then( server => {
    setTimeout( () => {
      server.close()
        .then( () => {
          setTimeout( () => log(), 1000).unref()
        })
    }, 3000).unref()
  })

