const upload = require('./upload')
const s3 = require('./s3')
const convertImage = require('./convertImage')
const getWidthHeight = require('./getWidthHeight')
const returnImage = require('./returnImage')
const urlPrefixing = require('./urlPrefixing')
const webp = require('./webp')
const Repo = require('./Repo')
const renderUrl = require('./renderUrl')

module.exports = {
  upload,
  s3,
  convertImage,
  getWidthHeight,
  returnImage,
  webp,
  Repo,
  urlPrefixing,
  renderUrl,
  ...urlPrefixing
}
