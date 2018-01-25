const upload = require('./upload')
const uploadS3 = require('./uploadS3')
const convertImage = require('./convertImage')
const getWidthHeight = require('./getWidthHeight')
const returnImage = require('./returnImage')
const urlPrefixing = require('./urlPrefixing')
const webp = require('./webp')

module.exports = {
  upload,
  uploadS3,
  convertImage,
  getWidthHeight,
  returnImage,
  webp,
  urlPrefixing,
  ...urlPrefixing
}
