var fs = require('fs')
var path = require('path')

module.exports = (db, dir, file) => {
  const filePath = path.join(
    __dirname,
    '../..',
    dir,
    file
  )
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
    .then(function (data) {
      return db.runSql(data)
    })
}
