const fs = require('fs')

let handlers = []
fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    handlers.push(require('./' + file))
  }
})

module.exports = handlers
