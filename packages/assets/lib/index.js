const upload = require('./upload')
const uploadS3 = require('./uploadS3')
const convertImage = require('./convertImage')
const getWidthHeight = require('./getWidthHeight')
const returnImage = require('./returnImage')
const urlPrefixing = require('./urlPrefixing')

module.exports = {
  upload,
  uploadS3,
  convertImage,
  getWidthHeight,
  returnImage,
  urlPrefixing,
  ...urlPrefixing
}
