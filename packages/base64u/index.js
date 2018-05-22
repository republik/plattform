const urlDecode = base64u =>
  `${base64u}${'==='.slice((base64u.length + 3) % 4)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/')

const urlEncode = string => string
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '')

// see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding, section about "Unicode Problem"
const toUnicode = string => encodeURIComponent(string).replace(
  /%([0-9A-F]{2})/g,
  function toSolidBytes (match, p1) {
    return String.fromCharCode('0x' + p1)
  }
)

// see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding, section about "Unicode Problem"
const fromUnicode = string => decodeURIComponent(
  string.split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join('')
)

module.exports = {
  decode: base64u => {
    return typeof window === 'object'
      ? fromUnicode(window.atob(urlDecode(base64u)))
      : Buffer.from(urlDecode(base64u), 'base64').toString('utf8')
  },
  encode: string => urlEncode(
    typeof window === 'object'
      ? window.btoa(toUnicode(string))
      : Buffer.from(string, 'utf8').toString('base64')
  ),
  match: base64u => /^[A-Za-z0-9\-_]+$/.test(base64u)
}
