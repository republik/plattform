// public/client exposed env

export const REPUBLIK_FRONTEND_URL =
  process.env.NEXT_PUBLIC_REPUBLIK_FRONTEND_URL || 'https://www.republik.ch'

export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const API_AUTHORIZATION_HEADER =
  process.env.NEXT_PUBLIC_API_AUTHORIZATION_HEADER

export const SG_COLORS = process.env.SG_COLORS
export const SG_FONT_FAMILIES = process.env.FONT_FAMILIES
export const SG_FONT_FACES = process.env.SG_FONT_FACES
export const SG_LOGO_PATH = process.env.SG_LOGO_PATH
export const SG_LOGO_VIEWBOX = process.env.SG_LOGO_VIEWBOX
export const SG_BRAND_MARK_PATH = process.env.SG_BRAND_MARK_PATH
export const SG_BRAND_MARK_VIEWBOX = process.env.SG_BRAND_MARK_VIEWBOX

export const MAILBOX_SELF = process.env.NEXT_PUBLIC_MAILBOX_SELF
