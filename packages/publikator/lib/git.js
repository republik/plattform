const crypto = require('crypto')

module.exports = {
  // https://stackoverflow.com/questions/7225313/how-does-git-compute-file-hashes
  hashObject: (blob) => {
    return crypto
      .createHash('sha1')
      .update('blob ')
      .update(blob.length.toString())
      .update('\0')
      .update(blob)
      .digest('hex')
  }
}
