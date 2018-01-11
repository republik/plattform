module.exports = async (id, salt) => {
  const crypto = require('crypto')
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(id, salt, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err)
      return resolve(derivedKey.toString('hex'))
    })
  })
}
