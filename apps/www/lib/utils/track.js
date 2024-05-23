import { ascending } from 'd3-array'
import { timeFormat } from 'd3-time-format'
import {
  matchAndroidUserAgent,
  matchIOSUserAgent,
} from '../context/UserAgentContext'

import { inNativeAppBrowserAppVersion } from '../withInNativeApp'

// needs to be compat with Postgres date casting
const formatDate = timeFormat('%Y-%m-%d')

export const getUtmParams = (query) => {
  // support /probelesen?campaign=x
  let defaultCampaign = query.campaign
  // check matomo attribution cookie
  if (typeof window !== 'undefined' && window.Matomo) {
    defaultCampaign =
      window.Matomo.getTracker().getAttributionCampaignName() || defaultCampaign
  }

  const params = defaultCampaign ? { utm_campaign: defaultCampaign } : {}

  Object.keys(query)
    .filter((key) => key.startsWith('utm_'))
    .sort((a, b) => ascending(a, b))
    .forEach((key) => {
      params[key] = query[key]
    })

  return params
}

export const getCampaignReferralParams = (query) => {
  let params = {}
  Object.keys(query)
    .filter((key) => key.startsWith('referral_'))
    .sort((a, b) => ascending(a, b))
    .forEach((key) => {
      params[key] = query[key]
    })

  return params
}

export const getCouponCodeParams = (query) => {
  let params = {}
  Object.keys(query)
    .filter((key) => key.startsWith('coupon'))
    .sort((a, b) => ascending(a, b))
    .forEach((key) => {
      params[key] = query[key]
    })

  return params
}

const createPayloadStore = (storeKey, limit = 15) => {
  let payload = {}
  let isEnabled = true

  const get = () => {
    let content
    try {
      content = JSON.parse(window.localStorage.getItem(storeKey))
    } catch (e) {}
    return content || payload
  }

  const record = (type, data) => {
    if (!isEnabled) {
      return
    }
    const current = get()
    const item = [data, formatDate(new Date())]
    if (!current[type]) {
      current[type] = []
    }
    const prev = current[type][0]
    if (JSON.stringify(item) === JSON.stringify(prev)) {
      return
    }
    current[type].unshift(item)
    if (current[type].length > limit) {
      current[type].splice(limit, current[type].length - limit)
    }
    try {
      window.localStorage.setItem(storeKey, JSON.stringify(current))
    } catch (e) {}
  }

  const disable = (shouldDisable = true) => {
    if (shouldDisable && isEnabled) {
      payload = {}
      try {
        window.localStorage.removeItem(storeKey)
      } catch (e) {}
    }
    isEnabled = !shouldDisable
  }

  return {
    get,
    record,
    disable,
  }
}

export const payload = createPayloadStore('republik-conversion-payload')

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
    ...payload.get(),
    ...getUtmParams(query),
    ...getCampaignReferralParams(query),
    ...getCouponCodeParams(query),
  }
}
