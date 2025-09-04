import { Logo, mediaQueries } from '@project-r/styleguide'

export const HEADER_HEIGHT = 60
export const HEADER_ICON_SIZE = 22
export const SUBHEADER_HEIGHT = 40
export const HEADER_HORIZONTAL_PADDING = 16

export const LOGO_HEIGHT = 28.02
export const LOGO_WIDTH = LOGO_HEIGHT * Logo.ratio
export const LOGO_PADDING = Math.floor((HEADER_HEIGHT - LOGO_HEIGHT - 1) / 2)

export const LOGO_HEIGHT_MOBILE = 22.78
export const LOGO_WIDTH_MOBILE = LOGO_HEIGHT_MOBILE * Logo.ratio
export const LOGO_PADDING_MOBILE = Math.floor((HEADER_HEIGHT - LOGO_HEIGHT_MOBILE - 1) / 2)

export const FRAME_CONTENT_PADDING = 50
export const FRAME_CONTENT_PADDING_MOBILE = 25

export const TESTIMONIAL_IMAGE_SIZE = 238

export const ZINDEX_GALLERY = 50
export const ZINDEX_LOADINGBAR = 49
export const ZINDEX_POPOVER = 40
export const ZINDEX_HEADER = 20
export const ZINDEX_BOTTOM_PANEL = 16
export const ZINDEX_CONTENT = 15
export const ZINDEX_FOOTER = 11
export const ZINDEX_SIDEBAR = 10
export const ZINDEX_FEED_STICKY_SECTION_LABEL = 2
export const ZINDEX_FRAME_TOGGLE = 1

export const DEFAULT_TOKEN_TYPE = 'EMAIL_TOKEN'
export const SUPPORTED_TOKEN_TYPES = [DEFAULT_TOKEN_TYPE, 'APP']

export const TRANSITION_MS = 200

export const AUDIO_PLAYER_HEIGHT = 68
