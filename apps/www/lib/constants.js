export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const API_WS_URL = process.env.NEXT_PUBLIC_API_WS_URL

export const SCREENSHOT_SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SCREENSHOT_SERVER_BASE_URL
export const API_AUTHORIZATION_HEADER =
  process.env.NEXT_PUBLIC_API_AUTHORIZATION_HEADER

export const APP_OPTIONS =
  !!process.env.NEXT_PUBLIC_APP_OPTIONS &&
  process.env.NEXT_PUBLIC_APP_OPTIONS !== 'false' &&
  process.env.NEXT_PUBLIC_APP_OPTIONS !== '0'

export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL
export const CDN_FRONTEND_BASE_URL = process.env.PUBLIC_CDN_URL
export const RENDER_FRONTEND_BASE_URL =
  process.env.NEXT_PUBLIC_RENDER_FRONTEND_BASE_URL || PUBLIC_BASE_URL

export const PUBLIKATOR_BASE_URL = process.env.NEXT_PUBLIC_PUBLIKATOR_BASE_URL
export const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
export const PF_PSPID = process.env.NEXT_PUBLIC_PF_PSPID
export const PF_FORM_ACTION = process.env.NEXT_PUBLIC_PF_FORM_ACTION
export const PAYPAL_FORM_ACTION = process.env.NEXT_PUBLIC_PAYPAL_FORM_ACTION
export const PAYPAL_BUSINESS = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS
export const PAYPAL_DONATE_LINK = process.env.NEXT_PUBLIC_PAYPAL_DONATE_LINK

export const EMAIL_CONTACT = process.env.NEXT_PUBLIC_EMAIL_CONTACT
export const EMAIL_IR = process.env.NEXT_PUBLIC_EMAIL_IR
export const EMAIL_PAYMENT =
  process.env.NEXT_PUBLIC_EMAIL_PAYMENT || process.env.NEXT_PUBLIC_EMAIL_CONTACT

export const CURTAIN_MESSAGE = process.env.NEXT_PUBLIC_CURTAIN_MESSAGE
export const CURTAIN_META = process.env.NEXT_PUBLIC_CURTAIN_META
export const CURTAIN_COLORS = process.env.NEXT_PUBLIC_CURTAIN_COLORS

export const OPEN_ACCESS = process.env.NEXT_PUBLIC_OPEN_ACCESS === 'true'

export const DISCUSSION_POLL_INTERVAL_MS =
  +process.env.NEXT_PUBLIC_DISCUSSION_POLL_INTERVAL_MS || 0
export const STATS_POLL_INTERVAL_MS =
  +process.env.NEXT_PUBLIC_STATS_POLL_INTERVAL_MS || 0
export const STATUS_POLL_INTERVAL_MS =
  +process.env.NEXT_PUBLIC_STATUS_POLL_INTERVAL_MS || 0

export const GENERAL_FEEDBACK_DISCUSSION_ID =
  process.env.NEXT_PUBLIC_GENERAL_FEEDBACK_DISCUSSION_ID

export const ONBOARDING_PACKAGES = [
  'ABO',
  'BENEFACTOR',
  'MONTHLY_ABO',
  'YEARLY_ABO',
]

export const TRIAL_CAMPAIGN = process.env.NEXT_PUBLIC_TRIAL_CAMPAIGN
export const TRIAL_CAMPAIGNS = process.env.NEXT_PUBLIC_TRIAL_CAMPAIGNS
export const REGWALL_CAMPAIGN =
  process.env.NEXT_PUBLIC_REGWALL_TRIAL_CAMPAIGN_ID

export const SCHEMA_PUBLISHER = process.env.NEXT_PUBLIC_SCHEMA_PUBLISHER

export const isDev = process.env.NODE_ENV !== 'production'
export const isClient = typeof window !== 'undefined'

export const PROLITTERIS_OPT_OUT_CONSENT = 'PROLITTERIS_OPT_OUT'
