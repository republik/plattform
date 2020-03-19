const crypto = require('crypto')
const { v4: uuid } = require('uuid')
const { ascending } = require('d3-array')

// only use with flat objects
const uuidForObject = (obj) => {
  const objString = Object.keys(obj)
    .sort((a, b) => ascending(a, b))
    .map(key => `${key}=${obj[key]}`)
    .join(';')

  // sha1 is 20 bytes long
  const hash = crypto
    .createHash('sha1')
    .update(objString)
    .digest('hex')

  // fill randoms array with 16 numbers (0-255) => 16 bytes
  // 2 bytes of sha1 ignored
  const randoms = []
  let i = 0
  while (i < hash.length && randoms.length < 16) {
    randoms.push(
      parseInt(
        `${hash.charAt(i)}${hash.charAt(i + 1)}`,
        16
      )
    )
    i += 2
  }

  // uuid random needs to be 16 numbers (0-255)
  return uuid({ random: randoms })
}

module.exports = uuidForObject
