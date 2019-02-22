const phantom = require('./phantom')
const chromium = require('./chromium')

module.exports = async (params) => {
  if (chromium.canRender()) {
    return chromium.render(params)
  } else if (phantom.canRender()) {
    return phantom.render(params)
  }
  console.error('no renderer available')
}
