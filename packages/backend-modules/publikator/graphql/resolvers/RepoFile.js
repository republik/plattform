const {
  getUploadUrl,
  getPrivateUrl,
  getPublicUrl,
} = require('../../lib/File/utils')

module.exports = {
  url: (file) => {
    return (
      (file.status === 'PENDING' && getUploadUrl(file)) ||
      (file.status === 'PUBLIC' && getPublicUrl(file)) ||
      getPrivateUrl(file)
    )
  },
}
