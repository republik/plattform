// Recognized tokens for the `x-republik-features` request header. The
// header lets a trusted internal caller enable a feature for just their own
// GraphQL request, layered on top of (never overriding off) an existing
// env-var kill switch -- useful for testing in-progress work in shared
// environments without flipping the switch globally.
const RECOGNIZED_FEATURES = ['sanity'] as const

export type Feature = (typeof RECOGNIZED_FEATURES)[number]

const isFeature = (value: string): value is Feature =>
  (RECOGNIZED_FEATURES as readonly string[]).includes(value)

export const parseFeatureHeader = (
  headerValue: string | string[] | undefined,
): Set<Feature> => {
  const raw = Array.isArray(headerValue) ? headerValue.join(',') : headerValue
  if (!raw) {
    return new Set()
  }
  const features = raw
    .split(',')
    .map((value) => value.trim())
    .filter(isFeature)
  return new Set(features)
}

export const hasFeature = (
  requestFeatures: Set<Feature> | undefined,
  feature: Feature,
): boolean => Boolean(requestFeatures?.has(feature))

// Combines an existing env-var kill switch with the per-request override.
// The header can only turn a feature ON on top of an env var that's off; it
// can never turn one off that the env var already enabled.
export const isEnabledForRequest = (
  envVar: string,
  feature: Feature,
  requestFeatures: Set<Feature> | undefined,
): boolean => process.env[envVar] === 'true' || hasFeature(requestFeatures, feature)
