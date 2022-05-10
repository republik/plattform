// Workaround https://stackoverflow.com/questions/52390368
// Based on github.com/fanmingfei/array-reverse-ios12 by 明非
function buggyReverse() {
  const a = [1, 2]
  return String(a) === String(a.reverse())
}
if (buggyReverse()) {
  const originalReverse = Array.prototype.reverse
  // eslint-disable-next-line no-extend-native
  Array.prototype.reverse = function reverse() {
    // eslint-disable-next-line no-self-assign
    if (Array.isArray(this)) this.length = this.length
    return originalReverse.call(this)
  }
}

if (process.browser) {
  // react explodes when trying to set svg styles in browsers with svg disabled
  // - TorBrowser disables SVG by default
  //   document.createElementNS('http://www.w3.org/2000/svg', 'svg').style === undefined
  const svgSupport =
    !!document.createElementNS &&
    !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').style
  if (!svgSupport) {
    Object.defineProperty(Element.prototype, 'style', {
      get: function () {
        return {}
      },
    })
  }
}
