import { ascending } from 'd3-array'
import {
  matchAndroidUserAgent,
  matchIOSUserAgent,
} from '../context/UserAgentContext'

import { inNativeAppBrowserAppVersion } from '../withInNativeApp'

const getUtmParams = (query) => {
  // support /probelesen?campaign=x
  let defaultCampaign = query.campaign

  const params = defaultCampaign ? { utm_campaign: defaultCampaign } : {}

  Object.keys(query)
    .filter((key) => key.startsWith('utm_'))
    .sort((a, b) => ascending(a, b))
    .forEach((key) => {
      params[key] = query[key]
    })

  return params
}

const getCampaignReferralParams = (query) => {
  let params = {}
  Object.keys(query)
    .filter((key) => key.startsWith('referral_'))
    .sort((a, b) => ascending(a, b))
    .forEach((key) => {
      params[key] = query[key]
    })

  return params
}

const getCouponCodeParams = (query) => {
  let params = {}
  Object.keys(query)
    .filter((key) => key.startsWith('coupon'))
    .sort((a, b) => ascending(a, b))
    .forEach((key) => {
      params[key] = query[key]
    })

  return params
}

export const getConversionPayload = (query = {}) => {
  return {
    app: inNativeAppBrowserAppVersion
      ? {
          version: inNativeAppBrowserAppVersion,
          platform: matchIOSUserAgent(navigator.userAgent)
            ? 'ios'
            : matchAndroidUserAgent(navigator.userAgent)
            ? 'android'
            : 'unknown',
        }
      : undefined,
    ...getUtmParams(query),
    ...getCampaignReferralParams(query),
    ...getCouponCodeParams(query),
  }
}
