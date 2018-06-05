const useragent = require('useragent')

module.exports.detect = (ua) => {
  if (!ua) {
    return
  }

  // ToDo: Check what useragent.parse(ua) returns once it's regular ua with RepublikApp appended
  // - currently the app only sends RepublikApp and the result is Other 0.0 / Other 0.0
  if (ua.match(/RepublikApp/)) {
    return 'Republik App'
  }

  return useragent.parse(ua).toString()
}
