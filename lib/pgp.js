const openpgp = require('openpgp')

exports.getKeyId = string => {
  const key = openpgp.key.readArmored(String(string))
  if (key.err || !key.keys.length) {
    return null
  }
  return key.keys[0].primaryKey.keyid.toHex()
}
