require('fs').readdirSync(__dirname).forEach(function (file) {
  if (file !== 'index.js') {
    module.exports[file.split('.')[0]] = require('./' + file)
  }
})
