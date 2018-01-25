'use strict'

var fs = require('fs')
var path = require('path')
var Promise

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options) {
  Promise = options.Promise
}

exports.up = function (db) {
  var filePath = path.join(__dirname, 'sqls', '20180125114200-tokens-up.sql')
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
      if (err) return reject(err)
      console.log('received data: ' + data)

      resolve(data)
    })
  })
  .then(function (data) {
    return db.runSql(data)
  })
}

exports.down = function (db) {
  var filePath = path.join(__dirname, 'sqls', '20180125114200-tokens-down.sql')
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
      if (err) return reject(err)
      console.log('received data: ' + data)

      resolve(data)
    })
  })
  .then(function (data) {
    return db.runSql(data)
  })
}

exports._meta = {
  'version': 1
}
