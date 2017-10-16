const fs = require('fs')
const path = require('path')

const isDirectory = (...paths) => {
  return fs.lstatSync(path.join(__dirname, ...paths)).isDirectory()
}

fs.readdirSync(__dirname).forEach(file => {
  if (file !== 'index.js') {
    if (isDirectory(file)) {
      fs.readdirSync(path.join(__dirname, file)).forEach(file2 => {
        if (!isDirectory(file, file2)) {
          module.exports[file2.split('.')[0]] = require('./' + file + '/' + file2)
        }
      })
    } else {
      module.exports[file.split('.')[0]] = require('./' + file)
    }
  }
})
