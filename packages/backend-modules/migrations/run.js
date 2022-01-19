var fs = require('fs')
var path = require('path')

module.exports = (db, dir, file) => {
  const realDir = !dir.match(/backend-modules/)
    ? dir.replace(/^packages\//, '/packages/backend-modules/')
    : dir
  const filePath = path.join(__dirname, '../../..', realDir, file)
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  }).then(function (data) {
    return db.runSql(data)
  })
}
