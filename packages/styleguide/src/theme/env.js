const SG_ENV = {
  COLORS: process.env.SG_COLORS,
  DYNAMIC_COMPONENT_BASE_URLS: process.env.SG_DYNAMIC_COMPONENT_BASE_URLS,
  FONT_FAMILIES: process.env.SG_FONT_FAMILIES,
  FONT_STYLES: process.env.SG_FONT_STYLES,
  FONT_FACES: process.env.SG_FONT_FACES,
  BRAND_MARK_PATH: process.env.SG_BRAND_MARK_PATH,
  BRAND_MARK_VIEWBOX: process.env.SG_BRAND_MARK_VIEWBOX,
  LOGO_PATH: process.env.SG_LOGO_PATH,
  LOGO_VIEWBOX: process.env.SG_LOGO_VIEWBOX,
  LOGO_GRADIENT: process.env.SG_LOGO_GRADIENT,
}

export default SG_ENV

export const getJson = (key) => (SG_ENV[key] && JSON.parse(SG_ENV[key])) || {}
