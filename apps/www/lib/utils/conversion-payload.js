import { ascending } from 'd3-array'
import {
  matchAndroidUserAgent,
  matchIOSUserAgent,
} from '../context/UserAgentContext'

import { inNativeAppStaticVersion } from '../withInNativeApp'

import { getUTMSessionStorage } from '@app/lib/analytics/utm-session-storage'

export const getUtmParams = (query) => {
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

export const getConversionPayload = (query = {}, localContext = {}) => {
  return {
    localContext,
    app: inNativeAppStaticVersion
      ? {
          version: inNativeAppStaticVersion,
          platform: matchIOSUserAgent(navigator.userAgent)
            ? 'ios'
            : matchAndroidUserAgent(navigator.userAgent)
            ? 'android'
            : 'unknown',
        }
      : undefined,
    ...getUTMSessionStorage(),
    ...getUtmParams(query),
    ...getCampaignReferralParams(query),
    ...getCouponCodeParams(query),
  }
}
