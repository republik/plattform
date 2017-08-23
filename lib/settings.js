const ENV =
  typeof window !== 'undefined'
    ? window.__NEXT_DATA__.env
    : process.env

export const LOCALE = ENV.LOCALE
export const API_BASE_URL = ENV.API_BASE_URL
export const API_WS_BASE_URL = ENV.API_WS_BASE_URL
export const API_AUTHORIZATION_HEADER = ENV.API_AUTHORIZATION_HEADER

export { default as routes } from '../server/routes'

export const SG_COLORS = ENV.SG_COLORS
export const SG_FONT_FAMILIES = ENV.SG_FONT_FAMILIES
export const SG_FONT_FACES = ENV.SG_FONT_FACES
export const SG_LOGO_PATH = ENV.SG_LOGO_PATH
export const SG_LOGO_VIEWBOX = ENV.SG_LOGO_VIEWBOX
export const SG_BRAND_MARK_PATH = ENV.SG_BRAND_MARK_PATH
export const SG_BRAND_MARK_VIEWBOX = ENV.SG_BRAND_MARK_VIEWBOX
