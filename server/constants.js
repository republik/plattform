const ENV =
  typeof window !== 'undefined'
    ? window.__NEXT_DATA__.env
    : process.env

// public/client exposed env

module.exports = {}

module.exports.API_URL = ENV.API_URL

module.exports.SG_COLORS = ENV.SG_COLORS
module.exports.SG_FONT_FAMILIES =
  ENV.SG_FONT_FAMILIES
module.exports.SG_FONT_FACES = ENV.SG_FONT_FACES
module.exports.SG_LOGO_PATH = ENV.SG_LOGO_PATH
module.exports.SG_LOGO_VIEWBOX =
  ENV.SG_LOGO_VIEWBOX
module.exports.SG_BRAND_MARK_PATH =
  ENV.SG_BRAND_MARK_PATH
module.exports.SG_BRAND_MARK_VIEWBOX =
  ENV.SG_BRAND_MARK_VIEWBOX
