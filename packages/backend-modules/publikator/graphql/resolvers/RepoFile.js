const {
  getUploadUrl,
  getPrivateUrl,
  getPublicUrl,
} = require('../../lib/File/utils')

module.exports = {
  url: (file) => {
    return (
      (file.status === 'Pending' && getUploadUrl(file)) ||
      (file.status === 'Public' && getPublicUrl(file)) ||
      (file.status === 'Private' && getPrivateUrl(file)) ||
      null
    )
  },
}
