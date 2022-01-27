const openpgp = require('openpgp')

exports.getKeyId = async (string) => {
  const key = await openpgp.key.readArmored(String(string))
  if (!key || key.err || !key.keys.length) {
    return null
  }

  const chunks = key.keys[0].primaryKey.keyid
    .toHex()
    .toUpperCase()
    .match(/.{1,4}/g)

  return chunks.join(' ')
}

exports.containsPrivateKey = async (string) => {
  const key = await openpgp.key.readArmored(String(string))
  if (!key || key.err || !key.keys.length) {
    return null
  }
  for (let k of key.keys) {
    if (k.isPrivate()) {
      return true
    }
  }
  return false
}
