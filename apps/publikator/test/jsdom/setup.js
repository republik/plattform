const { JSDOM } = require('jsdom')

const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const { window } = jsdom

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce(
      (result, prop) => ({
        ...result,
        [prop]: Object.getOwnPropertyDescriptor(src, prop)
      }),
      {}
    )
  Object.defineProperties(target, props)
}

// stub to be able to mount slate
// - not functional
window.getSelection = () => {
  return {
    addRange: () => {},
    removeAllRanges: () => {}
  }
}

global.window = window
global.document = window.document
global.navigator = {
  userAgent: 'node.js'
}
require('raf/polyfill')
copyProps(window, global)
