const uploadS3 = require('./uploadS3')
const convertImage = require('./convertImage')
const urlPrefixing = require('./urlPrefixing')

module.exports = {
  uploadS3,
  convertImage,
  ...urlPrefixing
}
