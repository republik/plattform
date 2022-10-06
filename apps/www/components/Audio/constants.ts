// Version that introduced the new Audio API introduced with 'Hört hört'
export const NEW_AUDIO_API_VERSION = '2.2.0'

export const NEXT_PUBLIC_FEAT_HOERT_HOERT = process.env
  .NEXT_PUBLIC_FEAT_HOERT_HOERT
  ? Boolean(process.env.NEXT_PUBLIC_FEAT_HOERT_HOERT)
  : false
