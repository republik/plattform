const fs = require('fs')
const path = require('path')

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    if (fs.lstatSync(path.join(__dirname, file)).isDirectory()) {
      const dir = file.replace(/^_/, '')
      module.exports[dir] = require('./' + file + '/index')
    } else {
      module.exports[file.split('.')[0]] = require('./' + file)
    }
  }
})
